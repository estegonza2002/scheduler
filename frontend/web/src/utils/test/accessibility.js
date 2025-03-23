
import React from 'react';
import ReactDOM from 'react-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

// Add the custom matcher to Jest
expect.extend(toHaveNoViolations);

// Create a helper function for accessibility testing in component tests
export async function checkAccessibility(component) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  ReactDOM.render(component, container);
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  
  ReactDOM.unmountComponentAtNode(container);
  container.remove();
}
