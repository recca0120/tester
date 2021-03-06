'use babel';

/* @flow */
import { TextBuffer, TextEditor } from 'atom';
import EditorTester from '../lib/editor-tester';
import { sleep } from './common';

describe('EditorTester', () => {
  let textEditor;

  beforeEach(async () => {
    const buffer = new TextBuffer({ text: 'some text' });
    textEditor = new TextEditor({ buffer, largeFileMode: true });
  });
  afterEach(() => {
    atom.workspace.destroyActivePaneItem();
  });

  describe('When creating a new EditorTester', () => {
    it('shoud not throw', () => {
      expect(() => new EditorTester()).not.toThrow();
    });
  });

  describe('When destroy event is called', () => {
    it('should call onDidDestroy callback from EditorTester', () => {
      let triggered = false;
      const editor = new EditorTester(textEditor);
      editor.onDidDestroy(() => {
        triggered = true;
      });
      expect(triggered).toBe(false);
      textEditor.destroy();
      expect(triggered).toBe(true);
    });
  });

  describe('When saving a TextEditor', () => {
    it('should trigger onShouldTest event', async () => {
      atom.config.set('tester.testOnSave', true);
      let timesTriggered = 0;
      const editor = new EditorTester(textEditor);
      editor.onShouldTest(() => {
        timesTriggered += 1;
      });
      textEditor.save();
      textEditor.save();
      textEditor.save();
      textEditor.save();
      expect(timesTriggered).toBe(0);
      await sleep(10);
      expect(timesTriggered).toBe(1);
      textEditor.save();
      textEditor.save();
      textEditor.save();
      textEditor.save();
      expect(timesTriggered).toBe(1);
      await sleep(10);
      expect(timesTriggered).toBe(2);
    });
  });
});
