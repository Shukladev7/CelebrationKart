(() => {
  const ROUTES = {
    signup: './components/signup.html',
    login: './components/login.html',
  };

  const MODAL_FRAME_SELECTOR = '#welcome-modal-frame';

  function normalizeText(text) {
    return (text || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function setModalState(isOpen) {
    const modalFrame = document.querySelector(MODAL_FRAME_SELECTOR);
    if (!modalFrame) return;
    modalFrame.classList.toggle('active', isOpen);
  }

  function navigateTo(route) {
    if (!route) return;
    window.location.href = route;
  }

  function bindHomeTriggers() {
    const modalFrame = document.querySelector(MODAL_FRAME_SELECTOR);
    if (!modalFrame) return;

    const triggerElements = new Set();
    const loginLink = document.getElementById('link-login');
    if (loginLink) triggerElements.add(loginLink);

    const homeActions = document.querySelectorAll('a, button');
    homeActions.forEach((element) => {
      const label = normalizeText(element.textContent);
      if (label === 'get started' || label === 'login') {
        triggerElements.add(element);
      }
    });

    triggerElements.forEach((trigger) => {
      trigger.addEventListener('click', (event) => { 
        event.preventDefault();
        setModalState(true);
      });
    });
  }

  function bindWelcomeModal() {
    const modalFrame = document.querySelector(MODAL_FRAME_SELECTOR);
    if (!modalFrame) return;

    const bindFrameHandlers = () => {
      const frameDocument = modalFrame.contentDocument;
      if (!frameDocument || frameDocument.body?.dataset.authBound === 'true') return;

      frameDocument.documentElement.style.background = 'transparent';
      frameDocument.body.style.background = 'transparent';

      const closeButton = frameDocument.querySelector('.close-btn');
      const continueWithEmailButton = frameDocument.querySelector('.btn-primary');
      const modalLoginLink = frameDocument.querySelector('.login-line a');

      if (closeButton) {
        closeButton.addEventListener('click', () => setModalState(false));
      }

      if (continueWithEmailButton) {
        continueWithEmailButton.addEventListener('click', () => navigateTo(ROUTES.signup));
      }

      if (modalLoginLink) {
        modalLoginLink.addEventListener('click', (event) => {
          event.preventDefault();
          navigateTo(ROUTES.login);
        });
      }

      frameDocument.body.dataset.authBound = 'true';
    };

    modalFrame.addEventListener('load', bindFrameHandlers);
    if (modalFrame.contentDocument?.readyState === 'complete') {
      bindFrameHandlers();
    }
  }

  function init() {
    bindHomeTriggers();
    bindWelcomeModal();
  }

  window.addEventListener('includes:loaded', init, { once: true });
})();
