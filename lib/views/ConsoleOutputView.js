'use babel';

/** @jsx etch.dom */
/* @flow*/
import etch from 'etch';
import { Emitter, CompositeDisposable } from 'atom';
import { convertAnsiStringToHtml, escapeHtml } from '../helpers';

export const defaultContent = '<i>No console output</i>';

export default class ConsoleOutputView {
  properties: {
    output: string;
    shouldAnsiToHtml: boolean;
  }
  refs: any;
  element: any;
  panel: any;
  emitter: Emitter;
  disposables: CompositeDisposable;

  constructor(properties:Object) {
    this.properties = properties;
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();
    etch.initialize(this);

    let content = properties.output;
    if (!content) {
      content = defaultContent;
    } else {
      content = escapeHtml(content);
      if (this.properties.ansiToHtml) {
        content = convertAnsiStringToHtml(content);
      }
    }
    this.refs.output.innerHTML = content;
  }

  render() {
    return (
      <div class='tester-view'>
        <pre class='output' ref='output'></pre>
      </div>
    );
  }

  update(newProperties:Object) {
    if (this.properties.output !== newProperties.output) {
      let content = newProperties.output;
      if (!content) {
        content = defaultContent;
      } else {
        content = escapeHtml(content);
        if (this.properties.ansiToHtml) {
          content = convertAnsiStringToHtml(content);
        }
      }
      this.refs.output.innerHTML = content;
      this.properties.output = newProperties.output;
      if (this.properties.scrollToBottom) {
        this.refs.output.scrollTop = this.refs.output.scrollHeight;
      }
      return etch.update(this);
    }
    return Promise.resolve();
  }

  async destroy() {
    await etch.destroy(this);
    this.disposables.dispose();
  }

  getTitle() {
    return 'Tester Console';
  }

  getIconName() {
    return 'terminal';
  }

  getDefaultLocation() {
    return 'bottom';
  }

  getAllowedLocations() {
    return ['left', 'right', 'bottom'];
  }

  getURI() {
    return 'atom://tester-console-output';
  }

  getElement() {
    return this.element;
  }

  serialize() {
    return {
      deserializer: 'tester-console-output',
    };
  }
}
