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

      element.innerHTML = await response.text();
    })
  );
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadIncludes();
  } catch (error) {
    console.error(error);
  }
});
