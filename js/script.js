/**
 * polyfill for Element.matches
 */
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

/**
 * @function debounce
 * @param {Function} fn The function to run after a certain amount of time
 * @param {Number} wait The delay time in milliseconds
 * @return {Function}
 */
const debounce = (fn, wait) => {
  let timer;
  return function() {
    const fnCall = () => fn.apply(this, arguments);
    clearTimeout(timer);
    timer = setTimeout(fnCall, wait)
  }
};

/**
 * implementation for Accessible Layerpopup
 * @module SlidingMenu
 * @param {Element} doc document element
 */
const SlidingMenu = (() => {
  'use strict';

  const rootEl = document.documentElement;
  /**
   * @private {String} tabbableSelector The selector for selecting a tabbable elements
   */
  const tabbableSelector = `button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])`;
  /**
   * @private {Object} props
   * @property {HTMLElement} props.trigger=null The element that triggers sliding panel
   * @property {HTMLElement} props.panel=null The element that is sliding panel
   * @property {NodeList} props.tabbableEls=null The tabbable elements inside sliding panel
   * @property {HTMLElement} props.firstTabbable=null The first tabbable elements inside sliding panel
   * @property {HTMLElement} props.lastTabbable=null The last tabbable elements inside sliding panel
   * @property {String} props.inertOmmits=null The selector for elements that should not be inert when sliding panel is opened
   */
  const props = {
    trigger: null,
    panel: null,
    tabbableEls: null,
    firstTabbable: null,
    lastTabbable: null,
    inertOmmits: null,
  };

  /**
   * @public
   * @function init
   * @param {Object} options
   * @param {Element} options.trigger
   * @param {Element} options.panel
   * @param {String} options.inertOmmits
   */
  const init = function(options) {
    const {
      trigger,
      panel,
      inertOmmits,
    } = options;

    if(!trigger || !panel) {
      throw new Error("SlidingMenu can't initialized.\ncheck your options");
    }

    // initializing props's properties
    props.trigger = trigger;
    props.panel = panel;
    props.tabbableEls = panel.querySelectorAll(tabbableSelector);
    props.firstTabbable = props.tabbableEls && props.tabbableEls[0];
    props.lastTabbable = props.tabbableEls && props.tabbableEls[props.tabbableEls.length - 1];
    props.inertOmmits = inertOmmits;

    // bind events for activating open/close slide menu
    panel.addEventListener('transitionend', handlerTransitionEvt, false);
    trigger.addEventListener('click', toggleNavigation, false);
  };

  /**
   * return current visibility
   * @public
   * @function isVisible
   * @return {Boolean}
   */
  const isVisible = () => {
    const { panel } = props;
    return panel.classList.contains('nav--animate');
  };

  /**
   * @private
   * @function toggleNavigation
   */
  const toggleNavigation = () => {
    if(isVisible()) closePanel();
    else openPanel();
  };

  /**
   * @private
   * @function openPanel
   */
  const openPanel = () => {
    const {
      panel,
      trigger,
    } = props;
    rootEl.classList.add('sidebar-opened');
    document.addEventListener('keydown', handlerKeyEvt, false);

    debounce(() => {
      panel.classList.add('nav--animate');
      panel.setAttribute('aria-hidden', 'false');

      trigger.lastChild.textContent = `close`;
      trigger.setAttribute('aria-expanded', 'true');
      setInertness(panel);
    }, 50)();
  };

  /**
   * @private
   * @function closePanel
   */
  const closePanel = () => {
    const { panel } = props;

    unsetInertness();
    panel.classList.remove('nav--animate');
    document.removeEventListener('keydown', handlerKeyEvt, false);
  };

  /**
   * set inert elements of the bottom page except menu element when the menu is opened
   * @private
   * @function setInertness
   */
  const setInertness = () => {
    const {
      inertOmmits,
      panel,
    } = props;

    for(let i = -1, node; node = panel.parentNode.children[++i];) {
      if(node === panel || node.matches(inertOmmits))
        continue;
      node.setAttribute('aria-hidden', 'true');
      node.setAttribute('inert', '');
    }
  }

  /**
   * unset inert elements when the menu is closed
   * @private
   * @function unsetInertness
   */
  const unsetInertness = () => {
    const nodes = document.querySelectorAll('[inert]');
    for(let i = -1, node; node = nodes[++i];){
      node.removeAttribute('aria-hidden');
      node.removeAttribute('inert');
    }
  }

  /**
   * handle after the css animation ends
   * @private
   * @function handlerTransitionEvt
   */
  const handlerTransitionEvt = () => {
    const {
      firstTabbable,
      trigger,
      panel,
    } = props;
    debounce(() => {
      if(isVisible()) {
        firstTabbable.focus();
      }else{
        trigger.lastChild.textContent = `menu`;
        trigger.setAttribute('aria-expanded', 'false');
        rootEl.classList.remove('sidebar-opened');
        panel.setAttribute('aria-hidden', 'true');
        trigger.focus();
      }
    }, 20)();
  };

  /**
   * make a trap for the focus movement via tab key, and closing feature via ESC key
   * @private
   * @function handlerKeyEvt
   * @param {Event}
   */
  const handlerKeyEvt = event => {
    event = event || window.event;
    const {
      keyCode,
      which,
      target,
      srcElement,
      shiftKey,
    } = event;
    const {
      lastTabbable,
      firstTabbable,
      trigger,
    } = props;
    const keycode = keyCode || which;
    const el = target || srcElement;

    switch (keycode) {
      case 27:
        if(isVisible()) closePanel();
        break;
      case 9:
        if(isVisible() && el === trigger && shiftKey) {
          event.preventDefault();
          event.stopPropagation();
          lastTabbable.focus();
        }else if (isVisible() && el === trigger && !shiftKey) {
          event.preventDefault();
          event.stopPropagation();
          firstTabbable.focus();
        }else if(el === firstTabbable && shiftKey) {
          event.preventDefault();
          event.stopPropagation();
          trigger.focus();
        }else if(el === lastTabbable && !shiftKey) {
          event.preventDefault();
          event.stopPropagation();
          trigger.focus();
        }
        break;
    }
  };

  return {
    init,
    isVisible,
  }
})();

SlidingMenu.init({
  trigger: document.getElementsByClassName('nav-toggle')[0],
  panel: document.getElementsByClassName('nav')[0],
  inertOmmits: `.gnb, style, meta, link, base, script, .nav`,
})