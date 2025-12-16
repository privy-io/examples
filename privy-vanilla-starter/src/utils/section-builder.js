/**
 * Create a section component
 */
export function createSection({ name, description, filepath, actions, children }) {
  const section = document.createElement('div');
  section.className = 'section';

  const header = document.createElement('div');
  header.className = 'section-header';

  const titleRow = document.createElement('div');
  titleRow.className = 'section-title-row';

  const title = document.createElement('h3');
  title.className = 'section-title';
  title.textContent = name;
  titleRow.appendChild(title);

  if (filepath) {
    const filepathBadge = document.createElement('p');
    filepathBadge.className = 'section-filepath';
    filepathBadge.textContent = `@${filepath}`;
    titleRow.appendChild(filepathBadge);
  }

  header.appendChild(titleRow);

  if (description) {
    const desc = document.createElement('p');
    desc.className = 'section-description';
    desc.textContent = description;
    header.appendChild(desc);
  }

  section.appendChild(header);

  // Add children content if provided
  if (children) {
    const content = document.createElement('div');
    content.className = 'section-content';
    if (typeof children === 'string') {
      content.innerHTML = children;
    } else {
      content.appendChild(children);
    }
    section.appendChild(content);
  }

  // Add actions
  if (actions && actions.length > 0) {
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'section-actions';

    actions.forEach(action => {
      const button = document.createElement('button');
      button.className = 'button';
      button.textContent = action.name;
      button.disabled = action.disabled || false;
      
      if (!action.disabled) {
        button.addEventListener('click', action.function);
      }

      actionsContainer.appendChild(button);
    });

    section.appendChild(actionsContainer);
  }

  return section;
}

