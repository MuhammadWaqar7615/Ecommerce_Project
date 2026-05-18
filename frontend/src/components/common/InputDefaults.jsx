import { useEffect } from 'react';

export default function InputDefaults() {
  useEffect(() => {
    const applyLimits = () => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="search"], input[type="tel"], input[type="url"]');
      inputs.forEach((el) => {
        if (!el.hasAttribute('maxlength')) {
          if (el.type === 'email') el.setAttribute('maxlength', '254');
          else if (el.type === 'password') el.setAttribute('maxlength', '128');
          else el.setAttribute('maxlength', '255');
        }
        // ensure visual comfort
        el.style.padding = el.style.padding || '';
      });

      const textareas = document.querySelectorAll('textarea');
      textareas.forEach((ta) => {
        if (!ta.hasAttribute('maxlength')) ta.setAttribute('maxlength', '2000');
        if (!ta.hasAttribute('rows')) ta.setAttribute('rows', '4');
      });
    };

    applyLimits();

    const observer = new MutationObserver((mutations) => {
      // re-apply when new nodes are added
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          applyLimits();
          break;
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
