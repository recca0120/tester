'use babel';

/* @flow */
import { $ } from 'atom-space-pen-views';
import _ from 'lodash';
import { convertAnsiStringToHtml, escapeHtml } from './helpers';
/* flow-include
import type { TextEditor } from 'atom';
import type { Gutter } from './types'
*/

export function setInlineMessages(editor/* : TextEditor*/, messages/* : Array<Object>*/, shouldAnsiToHtml /* : boolean*/, inlineErrorPosition/* :string*/) {
  _.forEach(messages, (message) => {
    if (message.state !== 'failed') {
      return;
    }
    const marker = editor.markBufferRange(
        [[message.lineNumber, 0], [message.lineNumber, 0]],
        { invalidate: 'never' },
      );
    let content = message.error.message;
    content = escapeHtml(content);
    if (shouldAnsiToHtml) {
      content = convertAnsiStringToHtml(content, shouldAnsiToHtml);
    }
    const inlineMessage = $(document.createElement('div'))
      .addClass('inline-block tester-inline-message')
      .html(`${message.error.name}: ${content}`);


    editor.decorateMarker(marker, {
      type: 'block',
      position: inlineErrorPosition,
      item: inlineMessage,
    });
    if (!editor.testerMarkers) {
      editor.testerMarkers = [];
    }
    editor.testerMarkers.push(marker);
  });
}

export function clearInlineMessages(editor/* : TextEditor*/) {
  editor.getBuffer().getMarkers().forEach((marker) => {
    marker.destroy();
  });
  if (editor.testerMarkers && editor.testerMarkers.length > 0) {
    editor.testerMarkers.forEach((marker) => {
      marker.destroy();
    });
  }
}

export function decorateGutter(editor/* :TextEditor*/, gutter/* :Gutter*/, messages/* : Array<Object>*/) {
  _.forEach(messages, (message) => {
    const tooltipDuration = $(document.createElement('span')).text(`${message.duration}ms`).addClass('highlight-info');
    const tooltipTesterName = $(document.createElement('span')).text('Tester').addClass('highlight');
    const tooltipTesterState = $(document.createElement('span')).append(message.state);
    if (message.state === 'passed') {
      tooltipTesterState.addClass('highlight-success');
    } else if (message.state === 'failed') {
      tooltipTesterState.addClass('highlight-error');
    } else {
      tooltipTesterState.addClass('highlight-warning');
    }
    const tooltip = $(document.createElement('span')).append(tooltipTesterName, tooltipTesterState, tooltipDuration).addClass('inline-block tester-tooltip-title');
    const item = $(document.createElement('span')).addClass(`block tester-gutter tester-highlight ${message.state}`);
    // https://atom.io/docs/api/v1.14.4/TooltipManager#instance-add
    atom.tooltips.add(item.get(0), {
      title: tooltip.html(),
      placement: 'right',
      delay: { show: 100, hide: 100 },
    });
    const marker = editor.getBuffer()
        .markRange([[message.lineNumber, 0], [message.lineNumber, 0]], { invalidate: 'inside' });
    gutter.decorateMarker(marker, {
      class: 'tester-row',
      item: item.get(0),
    });
  });
}