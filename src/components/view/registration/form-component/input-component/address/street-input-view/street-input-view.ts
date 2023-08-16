import ElementCreator from '../../../../../../utils/element-creator';
import View from '../../../../../view';
import fieldsetParams from '../../input-params';
import StreetInputParams from './street-params';

export default class StreetInputView extends View {
  constructor() {
    super(fieldsetParams.fieldset);
    this.render();
  }

  public render(): void {
    this.configure();
  }

  protected configure(): void {
    this.insertFieldsetItems();
  }

  public insertFieldsetItems(): void {
    // eslint-disable-next-line max-len
    const label = this.createLabel(StreetInputParams.label.textContent);
    this.addInnerElement(label);
    const input = this.createInput(StreetInputParams.input.type);
    this.addInnerElement(input);
    const errorSpan = this.createErrorText();
    this.addInnerElement(errorSpan);
    this.validateStreet(input, errorSpan);
    this.showError(input, errorSpan);
  }

  private createInput(type: string): HTMLInputElement {
    const input = new ElementCreator(fieldsetParams.input).getElement() as HTMLInputElement;
    input.setAttribute('type', type);
    input.setAttribute('minLength', StreetInputParams.input.minLength);
    input.setAttribute('required', fieldsetParams.input.required);
    return input;
  }

  private createLabel(text: string): ElementCreator {
    const label = new ElementCreator(fieldsetParams.label);
    label.setTextContent(text);
    return label;
  }

  private createErrorText(): HTMLElement {
    const errorSpan = new ElementCreator(fieldsetParams.errorSpan).getElement();
    return errorSpan;
  }

  public validateStreet(element: HTMLInputElement, errorMessage: HTMLElement) {
    const errorSpan = errorMessage;
    element.addEventListener('input', () => {
      if (element.validity.valid) {
        errorSpan.textContent = '';
        errorSpan.classList.add(StreetInputParams.errorSpan.cssClasses);
      } else {
        this.showError(element, errorMessage);
      }
    });
  }

  public showError(input: HTMLInputElement, errorMessage: HTMLElement) {
    const errorSpan = errorMessage;
    if (input.validity.valueMissing) {
      errorSpan.textContent = 'Please fill in this address field';
    } else if (input.validity.tooShort) {
      errorSpan.textContent = `Street name should be at least ${input.minLength} characters long; you entered ${input.value.length}`;
    }
    errorSpan.classList.add(StreetInputParams.errorSpan.cssClassesActive);
  }
}
