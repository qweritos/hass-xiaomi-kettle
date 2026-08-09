/** Rebuild Lovelace error placeholders if this module finished loading after the view. */
function rebuildErrorCards(root: ParentNode = document): void {
  const errorCards = new Set<Element>();

  const visit = (parent: ParentNode): void => {
    parent.querySelectorAll('hui-error-card').forEach((element) => errorCards.add(element));
    parent.querySelectorAll('*').forEach((element) => {
      if (element.shadowRoot) visit(element.shadowRoot);
    });
  };

  visit(root);
  errorCards.forEach((element) =>
    element.dispatchEvent(new CustomEvent('ll-rebuild', { bubbles: true, composed: true })),
  );
}

export function installStartupRecovery(): void {
  for (const delay of [0, 250, 1_000, 2_500]) {
    window.setTimeout(() => rebuildErrorCards(), delay);
  }
}
