function getIncludeParts(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  return {
    headNodes: Array.from(doc.head.children),
    bodyMarkup: doc.body.innerHTML.trim() || html,
  };
}

function cloneNodeForDocument(node) {
  return document.importNode(node, true);
}

function appendHeadAssets(nodes, includePath) {
  nodes.forEach((node, index) => {
    const tagName = node.tagName?.toLowerCase();

    if (!['style', 'link'].includes(tagName)) {
      return;
    }

    const marker = `include-${includePath}-${index}`;
    if (document.head.querySelector(`[data-include-asset="${marker}"]`)) {
      return;
    }

    const clone = cloneNodeForDocument(node);
    clone.setAttribute('data-include-asset', marker);
    document.head.appendChild(clone);
  });
}

async function runEmbeddedScripts(container) {
  const scripts = Array.from(container.querySelectorAll('script'));

  for (const script of scripts) {
    const executableScript = document.createElement('script');

    Array.from(script.attributes).forEach((attribute) => {
      executableScript.setAttribute(attribute.name, attribute.value);
    });

    executableScript.textContent = script.textContent;
    script.replaceWith(executableScript);

    if (executableScript.src) {
      await new Promise((resolve, reject) => {
        executableScript.addEventListener('load', resolve, { once: true });
        executableScript.addEventListener('error', reject, { once: true });
      });
    }
  }
}

async function loadIncludes() {
  const includeTargets = document.querySelectorAll('[data-include]');

  await Promise.all(
    Array.from(includeTargets, async (element) => {
      const includePath = element.getAttribute('data-include');

      if (!includePath) {
        return;
      }

      const response = await fetch(includePath);
      if (!response.ok) {
        throw new Error(`Failed to load component: ${includePath}`);
      }

      const html = await response.text();
      const { headNodes, bodyMarkup } = getIncludeParts(html);

      appendHeadAssets(headNodes, includePath);
      element.innerHTML = bodyMarkup;
      await runEmbeddedScripts(element);
    })
  );
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadIncludes();
    window.dispatchEvent(new CustomEvent('includes:loaded'));
  } catch (error) {
    console.error(error);
  }
});
