var $__scripts_47_lib_47_command_46_js__ = (function() {
  "use strict";
  var __moduleName = "scripts/lib/command.js";
  var Command = function() {
    function Command() {
      this._regex = /^$/i;
    }
    return ($traceurRuntime.createClass)(Command, {
      match: function(text) {
        return text.search(this._regex);
      },
      execute: function(text, tabDebugger, commandContext) {}
    }, {});
  }();
  var $__default = Command;
  return {get default() {
      return $__default;
    }};
})();
var $__scripts_47_lib_47_helpers_47_css_46_js__ = (function() {
  "use strict";
  var __moduleName = "scripts/lib/helpers/css.js";
  function toCSSProperty(text) {
    return text.toLowerCase().replace(' ', '-');
  }
  var cssUnits = {
    pixel: 'px',
    pixels: 'px',
    em: 'em',
    ems: 'em',
    percent: '%'
  };
  function toCSSValue(value, unit) {
    if (unit) {
      return value + cssUnits[unit];
    }
    return value;
  }
  function fromCSSValueToText(cssValue) {
    var matches = cssValue.match(/([0-9.]+)px/i);
    if (matches) {
      var numValue = matches[1];
      return (numValue === 1) ? 'one pixel' : numValue + ' pixels';
    }
    return cssValue;
  }
  var $__default = {};
  return {
    get toCSSProperty() {
      return toCSSProperty;
    },
    get toCSSValue() {
      return toCSSValue;
    },
    get fromCSSValueToText() {
      return fromCSSValueToText;
    },
    get default() {
      return $__default;
    }
  };
})();
var $__scripts_47_lib_47_commands_47_css_45_change_46_js__ = (function() {
  "use strict";
  var __moduleName = "scripts/lib/commands/css-change.js";
  var Command = ($__scripts_47_lib_47_command_46_js__).default;
  var $__1 = $__scripts_47_lib_47_helpers_47_css_46_js__,
      toCSSProperty = $__1.toCSSProperty,
      toCSSValue = $__1.toCSSValue;
  var CSSChangeCommand = function($__super) {
    function CSSChangeCommand(commandRunner) {
      $traceurRuntime.superConstructor(CSSChangeCommand).call(this, commandRunner);
      this._regex = /(change|set) (its )?(\w+( \w+)?) to (\w+) ?(pixel|pixels|percent|em|ems)?/i;
    }
    return ($traceurRuntime.createClass)(CSSChangeCommand, {
      execute: function(text, tabDebugger, commandContext) {
        var matches = text.match(this._regex);
        if (matches) {
          var property = toCSSProperty(matches[3]);
          var value = toCSSValue(matches[5], matches[6]);
          if (matches[3] === 'it') {
            property = commandContext.getContextCSSPropertyName();
          }
          commandContext.setContextCSSPropertyName(property);
          var css = ';' + property + ': ' + value + ';';
          return this.appendToStyles(commandContext.getContextNodeId(), css, tabDebugger);
        }
        return new Promise(function(resolve, reject) {
          reject('Text doesn\'t match the command.');
        });
      },
      appendToStyles: function(nodeId, text, tabDebugger) {
        console.log('CSSChangeCommand', nodeId, text);
        if (!nodeId) {
          throw new Error('Invalid context.');
        }
        return tabDebugger.sendCommand('DOM.getAttributes', {nodeId: nodeId}).then(function(data) {
          var oldStyleValue = '';
          if (data.attributes && data.attributes.indexOf('style') !== -1) {
            var idxOfStyle = data.attributes.indexOf('style');
            oldStyleValue = data.attributes[idxOfStyle + 1];
          }
          return tabDebugger.sendCommand('DOM.setAttributeValue', {
            nodeId: nodeId,
            name: 'style',
            value: oldStyleValue + text
          }).then(function() {
            tabDebugger.sendCommand('DOM.markUndoableState');
          });
        }).catch(function() {
          throw new Error('Node not found.');
        });
      }
    }, {}, $__super);
  }(Command);
  CSSChangeCommand.description = "Change CSS property value of currently inspected node by saying \"change its x to y\" or \"set its x to y\" (where \"x\" is the name of the CSS property and \"y\" is the new value).";
  var $__default = CSSChangeCommand;
  return {get default() {
      return $__default;
    }};
})();
var $__scripts_47_lib_47_commands_47_css_45_get_45_value_46_js__ = (function() {
  "use strict";
  var __moduleName = "scripts/lib/commands/css-get-value.js";
  var Command = ($__scripts_47_lib_47_command_46_js__).default;
  var $__1 = $__scripts_47_lib_47_helpers_47_css_46_js__,
      toCSSProperty = $__1.toCSSProperty,
      fromCSSValueToText = $__1.fromCSSValueToText;
  var CSSGetValueCommand = function($__super) {
    function CSSGetValueCommand(commandRunner) {
      $traceurRuntime.superConstructor(CSSGetValueCommand).call(this, commandRunner);
      this._regex = /(what's|what is|get)( its)? (\w+( \w+)?)/i;
    }
    return ($traceurRuntime.createClass)(CSSGetValueCommand, {
      execute: function(text, tabDebugger, commandContext) {
        var matches = text.match(this._regex);
        if (matches) {
          var property = toCSSProperty(matches[3]);
          commandContext.setContextCSSPropertyName(property);
          return this.getComputedValue(property, commandContext.getContextNodeId(), tabDebugger);
        }
        return new Promise(function(resolve, reject) {
          reject('Text doesn\'t match the command.');
        });
      },
      getComputedValue: function(property, nodeId, tabDebugger) {
        console.log('CSSGetValueCommand', property, nodeId);
        if (!nodeId) {
          throw new Error('Invalid context.');
        }
        return tabDebugger.sendCommand('CSS.getComputedStyleForNode', {nodeId: nodeId}).then(function(data) {
          var item = data.computedStyle.find(function(item) {
            return item.name === property;
          });
          if (item) {
            return property + ' value is ' + fromCSSValueToText(item.value);
          } else {
            return 'Property ' + property + ' not found.';
          }
        }).catch(function() {
          throw new Error('Node not found.');
        });
      }
    }, {}, $__super);
  }(Command);
  CSSGetValueCommand.description = "Get computed CSS property value of currently inspected node by saying \"get its x\" or \"what's its x\" (where \"x\" is the name of the CSS property).";
  var $__default = CSSGetValueCommand;
  return {get default() {
      return $__default;
    }};
})();
var $__scripts_47_lib_47_commands_47_node_45_deletion_46_js__ = (function() {
  "use strict";
  var __moduleName = "scripts/lib/commands/node-deletion.js";
  var Command = ($__scripts_47_lib_47_command_46_js__).default;
  var NodeDeletionCommand = function($__super) {
    function NodeDeletionCommand(commandRunner) {
      $traceurRuntime.superConstructor(NodeDeletionCommand).call(this, commandRunner);
      this._regex = /(delete|remove) it/i;
    }
    return ($traceurRuntime.createClass)(NodeDeletionCommand, {
      execute: function(text, tabDebugger, commandContext) {
        var matches = text.match(this._regex);
        if (matches) {
          return this.removeNode(commandContext.getContextNodeId(), tabDebugger);
        }
        return new Promise(function(resolve, reject) {
          reject('Text doesn\'t match the command.');
        });
      },
      removeNode: function(nodeId, tabDebugger) {
        console.log('NodeDeletionCommand', nodeId);
        if (!nodeId) {
          throw new Error('Invalid context.');
        }
        return tabDebugger.sendCommand('DOM.removeNode', {nodeId: nodeId}).then(function() {
          tabDebugger.sendCommand('DOM.markUndoableState');
        }).catch(function() {
          throw new Error('Node not found.');
        });
      }
    }, {}, $__super);
  }(Command);
  NodeDeletionCommand.description = "Remove currently inspected node with \"remove it\" or \"delete it\".";
  var $__default = NodeDeletionCommand;
  return {get default() {
      return $__default;
    }};
})();
var $__scripts_47_lib_47_commands_47_node_45_inspection_46_js__ = (function() {
  "use strict";
  var __moduleName = "scripts/lib/commands/node-inspection.js";
  var Command = ($__scripts_47_lib_47_command_46_js__).default;
  var HIGHLIGHT_COLOR = {
    r: 155,
    g: 11,
    b: 239,
    a: 0.7
  };
  var HIGHLIGHT_TIMEOUT = 2000;
  var NodeInspectionCommand = function($__super) {
    function NodeInspectionCommand(commandRunner) {
      $traceurRuntime.superConstructor(NodeInspectionCommand).call(this, commandRunner);
      this._regex = /(select|inspect) (\w+)/i;
    }
    return ($traceurRuntime.createClass)(NodeInspectionCommand, {
      execute: function(text, tabDebugger, commandContext) {
        var matches = text.match(this._regex);
        if (matches) {
          return this.selectNode(matches[2] + ', #' + matches[2] + ', .' + matches[2], tabDebugger, commandContext);
        }
        return new Promise(function(resolve, reject) {
          reject('Text doesn\'t match the command.');
        });
      },
      selectNode: function(selector, tabDebugger, commandContext) {
        console.log('NodeInspectionCommand', selector);
        var rootNodeId = commandContext.getRootNodeId();
        return tabDebugger.sendCommand('DOM.querySelector', {
          nodeId: rootNodeId,
          selector: selector
        }).then(function(data) {
          if (!data.nodeId) {
            throw new Error('Node not found.');
          }
          commandContext.setContextNodeId(data.nodeId);
          commandContext.setContextCSSPropertyName(null);
          return tabDebugger.sendCommand('DOM.highlightNode', {
            highlightConfig: {
              contentColor: HIGHLIGHT_COLOR,
              showInfo: true
            },
            nodeId: data.nodeId
          }).then(function() {
            setTimeout(function() {
              tabDebugger.sendCommand('DOM.hideHighlight');
            }, HIGHLIGHT_TIMEOUT);
          });
        }).catch(function() {
          throw new Error('Node not found.');
        });
      }
    }, {}, $__super);
  }(Command);
  NodeInspectionCommand.description = "Select DOM nodes with \"select x\" or \"inspect x\" (where \"x\" is the name of the tag, id or CSS class). If multiple nodes match, only the first one will be selected.";
  var $__default = NodeInspectionCommand;
  return {get default() {
      return $__default;
    }};
})();
var $__scripts_47_lib_47_commands_47_redo_46_js__ = (function() {
  "use strict";
  var __moduleName = "scripts/lib/commands/redo.js";
  var Command = ($__scripts_47_lib_47_command_46_js__).default;
  var RedoCommand = function($__super) {
    function RedoCommand(commandRunner) {
      $traceurRuntime.superConstructor(RedoCommand).call(this, commandRunner);
      this._regex = /redo/i;
    }
    return ($traceurRuntime.createClass)(RedoCommand, {
      execute: function(text, tabDebugger, commandContext) {
        var matches = text.match(this._regex);
        if (matches) {
          return this.redoLastAction(tabDebugger);
        }
        return new Promise(function(resolve, reject) {
          reject('Text doesn\'t match the command.');
        });
      },
      redoLastAction: function(tabDebugger) {
        console.log('RedoCommand');
        return tabDebugger.sendCommand('DOM.redo');
      }
    }, {}, $__super);
  }(Command);
  RedoCommand.description = "Redo last command with \"redo\".";
  var $__default = RedoCommand;
  return {get default() {
      return $__default;
    }};
})();
var $__scripts_47_lib_47_commands_47_undo_46_js__ = (function() {
  "use strict";
  var __moduleName = "scripts/lib/commands/undo.js";
  var Command = ($__scripts_47_lib_47_command_46_js__).default;
  var UndoCommand = function($__super) {
    function UndoCommand(commandRunner) {
      $traceurRuntime.superConstructor(UndoCommand).call(this, commandRunner);
      this._regex = /undo/i;
    }
    return ($traceurRuntime.createClass)(UndoCommand, {
      execute: function(text, tabDebugger, commandContext) {
        var matches = text.match(this._regex);
        if (matches) {
          return this.undoLastAction(tabDebugger);
        }
        return new Promise(function(resolve, reject) {
          reject('Text doesn\'t match the command.');
        });
      },
      undoLastAction: function(tabDebugger) {
        console.log('UndoCommand');
        return tabDebugger.sendCommand('DOM.undo');
      }
    }, {}, $__super);
  }(Command);
  UndoCommand.description = "Undo last command with \"undo\".";
  var $__default = UndoCommand;
  return {get default() {
      return $__default;
    }};
})();
var $__scripts_47_options_46_js__ = (function() {
  "use strict";
  var __moduleName = "scripts/options.js";
  var NodeInspectionCommand = ($__scripts_47_lib_47_commands_47_node_45_inspection_46_js__).default;
  var NodeDeletionCommand = ($__scripts_47_lib_47_commands_47_node_45_deletion_46_js__).default;
  var CSSChangeCommand = ($__scripts_47_lib_47_commands_47_css_45_change_46_js__).default;
  var CSSGetValueCommand = ($__scripts_47_lib_47_commands_47_css_45_get_45_value_46_js__).default;
  var UndoCommand = ($__scripts_47_lib_47_commands_47_undo_46_js__).default;
  var RedoCommand = ($__scripts_47_lib_47_commands_47_redo_46_js__).default;
  function initSpeechRecognition() {
    var recognition = new webkitSpeechRecognition();
    var errorNode = document.querySelector('.error');
    var loadingScreen = document.querySelector('.loading');
    var askScreen = document.querySelector('.ask');
    var successScreen = document.querySelector('.success');
    recognition.onstart = function() {
      loadingScreen.hidden = true;
      askScreen.hidden = true;
      successScreen.hidden = false;
      recognition.stop();
    };
    recognition.onerror = function(event) {
      errorNode.innerText = "Ups! Something went wrong, we got this error back: " + event.error;
    };
    recognition.start();
    setTimeout(function() {
      if (!loadingScreen.hidden) {
        loadingScreen.hidden = true;
        askScreen.hidden = false;
      }
    }, 300);
  }
  function initListOfVoices() {
    var voiceSelect = document.querySelector('#voice');
    voiceSelect.addEventListener('change', function() {
      var voiceName = voiceSelect.value;
      if (voiceName !== '') {
        localStorage.setItem('voiceName', voiceName);
        chrome.tts.speak(voiceName + ' voice selected.', {voiceName: voiceName});
      } else {
        localStorage.removeItem('voiceName');
        chrome.tts.speak('Default voice selected.');
      }
    });
    chrome.tts.getVoices(function(list) {
      list.filter(function(voice) {
        return (voice.lang.substr(0, 3) === 'en-');
      }).forEach(function(voice) {
        var option = document.createElement('option');
        option.innerText = voice.voiceName;
        if (voice.voiceName === localStorage.voiceName) {
          option.selected = true;
        }
        voiceSelect.appendChild(option);
      });
    });
  }
  function initListOfCommands() {
    var commandsList = document.querySelector('#commands');
    [NodeInspectionCommand, NodeDeletionCommand, CSSChangeCommand, CSSGetValueCommand, UndoCommand, RedoCommand].forEach(function(command) {
      var li = document.createElement('li');
      li.innerText = command.description;
      commandsList.appendChild(li);
    });
  }
  initSpeechRecognition();
  initListOfVoices();
  initListOfCommands();
  return {};
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIiIsInNjcmlwdHMvbGliL2NvbW1hbmQuanMiLCJzY3JpcHRzL2xpYi9oZWxwZXJzL2Nzcy5qcyIsInNjcmlwdHMvbGliL2NvbW1hbmRzL2Nzcy1jaGFuZ2UuanMiLCJzY3JpcHRzL2xpYi9jb21tYW5kcy9jc3MtZ2V0LXZhbHVlLmpzIiwic2NyaXB0cy9saWIvY29tbWFuZHMvbm9kZS1kZWxldGlvbi5qcyIsInNjcmlwdHMvbGliL2NvbW1hbmRzL25vZGUtaW5zcGVjdGlvbi5qcyIsInNjcmlwdHMvbGliL2NvbW1hbmRzL3JlZG8uanMiLCJzY3JpcHRzL2xpYi9jb21tYW5kcy91bmRvLmpzIiwic2NyaXB0cy9vcHRpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsQUFBSSxJQUFBLENBQUEsWUFBVywyQkFBb0IsQ0FBQztJQ0E5QixRQUFNLEVBQVosQ0FBQSxTQUFTLEFBQUQ7QUFBUixXQUFNLFFBQU0sQ0FDRSxBQUFELENBQUc7QUFDWixTQUFHLE9BQU8sRUFBSSxNQUFJLENBQUM7SUFDckI7QUFTRixBQVZVLFNBQU8sQ0FBQSxDQUFDLGVBQWMsWUFBWSxDQUFDLEFBQUM7QUFHNUMsVUFBSSxDQUFKLFVBQU0sSUFBRyxDQUFHO0FBQ1YsYUFBTyxDQUFBLElBQUcsT0FBTyxBQUFDLENBQUMsSUFBRyxPQUFPLENBQUMsQ0FBQztNQUNqQztBQUVBLFlBQU0sQ0FBTixVQUFRLElBQUcsQ0FBRyxDQUFBLFdBQVUsQ0FBRyxDQUFBLGNBQWEsQ0FBRyxHQUUzQztBQUFBLFNBUjhELENBQUM7RUFDekQsQUFBQyxFQUFDO0FBSlYsQUFBSSxJQUFBLENBQUEsVUFBUyxFQWNFLFFBQU0sQUFkWSxDQUFBO0FBQWpDLFNBQUEsYUFBd0I7QUFBRSx1QkFBd0I7SUFBRSxFQUE3Qjs7OztBQUF2QixBQUFJLElBQUEsQ0FBQSxZQUFXLCtCQUFvQixDQUFDO0FDQTdCLFNBQVMsY0FBWSxDQUFFLElBQUcsQ0FBRztBQUNsQyxTQUFPLENBQUEsSUFBRyxZQUFZ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QUM7RUFDSjtBQUVBLFNBQVMsbUJBQWlCLENBQUUsQUFBRDtBQUN6QixBQUFJLE1BQUEsQ0FBQSxZQUFXLEVBQUksQ0FBQSxRQUFPLGNBQWMsQUFBQyxDQUFDLFdBQVUsQ0FBQyxDQUFDO0FBRXRELElBQ0UscUJBQW9CLENBQ3BCLG9CQUFrQixDQUNsQixpQkFBZSxDQUNmLG1CQUFpQixDQUNqQixZQUFVLENBQ1YsWUFBVSxDQUNaLFFBQVEsQUFBQyxDQUFDLFNBQUMsT0FBTSxDQUFNO0FBQ25CLEFBQUksUUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLFFBQU8sY0FBYyxBQUFDLENBQUMsSUFBRyxDQUFDLENBQUM7QUFDckMsT0FBQyxVQUFVLEVBQUksQ0FBQSxPQUFNLFlBQVksQ0FBQztBQUVsQyxpQkFBVyxZQUFZLEFBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUM5QixDQUFDLENBQUM7RUFDTjtBQUVBLHNCQUFvQixBQUFDLEVBQUMsQ0FBQztBQUN2QixpQkFBZSxBQUFDLEVBQUMsQ0FBQztBQUNsQixtQkFBaUIsQUFBQyxFQUFDLENBQUM7QUF0RnBCLFdBQXVCIiwiZmlsZSI6Ii9Vc2Vycy9rZHp3aW5lbC9Qcm9qZWN0cy9PUy9EZXZUb29sc1ZvaWNlQ29tbWFuZHMvdGVtcG91dE1DNHdNRGd5TlRRM09UTXdNRFk1TWpZM056VXJlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiY2xhc3MgQ29tbWFuZCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3JlZ2V4ID0gL14kL2k7XG4gIH1cblxuICBtYXRjaCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQuc2VhcmNoKHRoaXMuX3JlZ2V4KTtcbiAgfVxuXG4gIGV4ZWN1dGUodGV4dCwgdGFiRGVidWdnZXIsIGNvbW1hbmRDb250ZXh0KSB7XG5cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb21tYW5kOyIsImV4cG9ydCBmdW5jdGlvbiB0b0NTU1Byb3BlcnR5KHRleHQpIHtcbiAgcmV0dXJuIHRleHQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKCcgJywgJy0nKTtcbn1cblxubGV0IGNzc1VuaXRzID0ge1xuICBwaXhlbDogJ3B4JyxcbiAgcGl4ZWxzOiAncHgnLFxuICBlbTogJ2VtJyxcbiAgZW1zOiAnZW0nLFxuICBwZXJjZW50OiAnJSdcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0NTU1ZhbHVlKHZhbHVlLCB1bml0KSB7XG4gIGlmICh1bml0KSB7XG4gICAgcmV0dXJuIHZhbHVlICsgY3NzVW5pdHNbdW5pdF07XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tQ1NTVmFsdWVUb1RleHQoY3NzVmFsdWUpIHtcbiAgbGV0IG1hdGNoZXMgPSBjc3NWYWx1ZS5tYXRjaCgvKFswLTkuXSspcHgvaSk7XG5cbiAgaWYgKG1hdGNoZXMpIHtcbiAgICBsZXQgbnVtVmFsdWUgPSBtYXRjaGVzWzFdO1xuXG4gICAgcmV0dXJuIChudW1WYWx1ZSA9PT0gMSkgPyAnb25lIHBpeGVsJyA6IG51bVZhbHVlICsgJyBwaXhlbHMnO1xuICB9XG5cbiAgcmV0dXJuIGNzc1ZhbHVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7fTsiLCJpbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9jb21tYW5kLmpzJztcbmltcG9ydCB7dG9DU1NQcm9wZXJ0eSwgdG9DU1NWYWx1ZX0gZnJvbSAnLi4vaGVscGVycy9jc3MuanMnO1xuXG5jbGFzcyBDU1NDaGFuZ2VDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG4gIGNvbnN0cnVjdG9yKGNvbW1hbmRSdW5uZXIpIHtcbiAgICBzdXBlcihjb21tYW5kUnVubmVyKTtcbiAgICB0aGlzLl9yZWdleCA9IC8oY2hhbmdlfHNldCkgKGl0cyApPyhcXHcrKCBcXHcrKT8pIHRvIChcXHcrKSA/KHBpeGVsfHBpeGVsc3xwZXJjZW50fGVtfGVtcyk/L2k7XG4gIH1cblxuICBleGVjdXRlKHRleHQsIHRhYkRlYnVnZ2VyLCBjb21tYW5kQ29udGV4dCkge1xuICAgIGxldCBtYXRjaGVzID0gdGV4dC5tYXRjaCh0aGlzLl9yZWdleCk7XG5cbiAgICBpZihtYXRjaGVzKSB7XG4gICAgICBsZXQgcHJvcGVydHkgPSB0b0NTU1Byb3BlcnR5KG1hdGNoZXNbM10pO1xuICAgICAgbGV0IHZhbHVlID0gdG9DU1NWYWx1ZShtYXRjaGVzWzVdLCBtYXRjaGVzWzZdKTtcblxuICAgICAgaWYobWF0Y2hlc1szXSA9PT0gJ2l0Jykge1xuICAgICAgICBwcm9wZXJ0eSA9IGNvbW1hbmRDb250ZXh0LmdldENvbnRleHRDU1NQcm9wZXJ0eU5hbWUoKTtcbiAgICAgIH1cblxuICAgICAgY29tbWFuZENvbnRleHQuc2V0Q29udGV4dENTU1Byb3BlcnR5TmFtZShwcm9wZXJ0eSk7XG5cbiAgICAgIGxldCBjc3MgPSAnOycgKyBwcm9wZXJ0eSArICc6ICcgKyB2YWx1ZSArICc7JztcbiAgICAgIHJldHVybiB0aGlzLmFwcGVuZFRvU3R5bGVzKGNvbW1hbmRDb250ZXh0LmdldENvbnRleHROb2RlSWQoKSwgY3NzLCB0YWJEZWJ1Z2dlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHJlamVjdCgnVGV4dCBkb2VzblxcJ3QgbWF0Y2ggdGhlIGNvbW1hbmQuJyk7XG4gICAgfSk7XG4gIH1cblxuICBhcHBlbmRUb1N0eWxlcyhub2RlSWQsIHRleHQsIHRhYkRlYnVnZ2VyKSB7XG4gICAgY29uc29sZS5sb2coJ0NTU0NoYW5nZUNvbW1hbmQnLCBub2RlSWQsIHRleHQpO1xuXG4gICAgaWYoIW5vZGVJZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvbnRleHQuJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhYkRlYnVnZ2VyLnNlbmRDb21tYW5kKCdET00uZ2V0QXR0cmlidXRlcycsIHtcbiAgICAgIG5vZGVJZFxuICAgIH0pLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgIGxldCBvbGRTdHlsZVZhbHVlID0gJyc7XG5cbiAgICAgIGlmKGRhdGEuYXR0cmlidXRlcyAmJiBkYXRhLmF0dHJpYnV0ZXMuaW5kZXhPZignc3R5bGUnKSAhPT0gLTEpIHtcbiAgICAgICAgbGV0IGlkeE9mU3R5bGUgPSBkYXRhLmF0dHJpYnV0ZXMuaW5kZXhPZignc3R5bGUnKTtcbiAgICAgICAgb2xkU3R5bGVWYWx1ZSA9IGRhdGEuYXR0cmlidXRlc1tpZHhPZlN0eWxlICsgMV07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0YWJEZWJ1Z2dlci5zZW5kQ29tbWFuZCgnRE9NLnNldEF0dHJpYnV0ZVZhbHVlJywge1xuICAgICAgICBub2RlSWQsXG4gICAgICAgIG5hbWU6ICdzdHlsZScsXG4gICAgICAgIHZhbHVlOiBvbGRTdHlsZVZhbHVlICsgdGV4dFxuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIC8vYWxsb3cgdW5kb2luZyBhdHRyaWJ1dGUgY2hhbmdlXG4gICAgICAgIHRhYkRlYnVnZ2VyLnNlbmRDb21tYW5kKCdET00ubWFya1VuZG9hYmxlU3RhdGUnKTtcbiAgICAgIH0pO1xuICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm9kZSBub3QgZm91bmQuJyk7XG4gICAgfSk7XG4gIH1cbn1cblxuQ1NTQ2hhbmdlQ29tbWFuZC5kZXNjcmlwdGlvbiA9IGBDaGFuZ2UgQ1NTIHByb3BlcnR5IHZhbHVlIG9mIGN1cnJlbnRseSBpbnNwZWN0ZWQgbm9kZSBieSBzYXlpbmcgXCJjaGFuZ2UgaXRzIHggdG8geVwiIG9yIFwic2V0IGl0cyB4IHRvIHlcIiAod2hlcmUgXCJ4XCIgaXMgdGhlIG5hbWUgb2YgdGhlIENTUyBwcm9wZXJ0eSBhbmQgXCJ5XCIgaXMgdGhlIG5ldyB2YWx1ZSkuYDtcblxuZXhwb3J0IGRlZmF1bHQgQ1NTQ2hhbmdlQ29tbWFuZDsiLCJpbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9jb21tYW5kLmpzJztcbmltcG9ydCB7dG9DU1NQcm9wZXJ0eSwgZnJvbUNTU1ZhbHVlVG9UZXh0fSBmcm9tICcuLi9oZWxwZXJzL2Nzcy5qcyc7XG5cbmNsYXNzIENTU0dldFZhbHVlQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuICBjb25zdHJ1Y3Rvcihjb21tYW5kUnVubmVyKSB7XG4gICAgc3VwZXIoY29tbWFuZFJ1bm5lcik7XG4gICAgdGhpcy5fcmVnZXggPSAvKHdoYXQnc3x3aGF0IGlzfGdldCkoIGl0cyk/IChcXHcrKCBcXHcrKT8pL2k7XG4gIH1cblxuICBleGVjdXRlKHRleHQsIHRhYkRlYnVnZ2VyLCBjb21tYW5kQ29udGV4dCkge1xuICAgIGxldCBtYXRjaGVzID0gdGV4dC5tYXRjaCh0aGlzLl9yZWdleCk7XG5cbiAgICBpZihtYXRjaGVzKSB7XG4gICAgICBsZXQgcHJvcGVydHkgPSB0b0NTU1Byb3BlcnR5KG1hdGNoZXNbM10pO1xuXG4gICAgICBjb21tYW5kQ29udGV4dC5zZXRDb250ZXh0Q1NTUHJvcGVydHlOYW1lKHByb3BlcnR5KTtcbiAgICAgIHJldHVybiB0aGlzLmdldENvbXB1dGVkVmFsdWUocHJvcGVydHksIGNvbW1hbmRDb250ZXh0LmdldENvbnRleHROb2RlSWQoKSwgdGFiRGVidWdnZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZWplY3QoJ1RleHQgZG9lc25cXCd0IG1hdGNoIHRoZSBjb21tYW5kLicpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0Q29tcHV0ZWRWYWx1ZShwcm9wZXJ0eSwgbm9kZUlkLCB0YWJEZWJ1Z2dlcikge1xuICAgIGNvbnNvbGUubG9nKCdDU1NHZXRWYWx1ZUNvbW1hbmQnLCBwcm9wZXJ0eSwgbm9kZUlkKTtcblxuICAgIGlmKCFub2RlSWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb250ZXh0LicpO1xuICAgIH1cblxuICAgIHJldHVybiB0YWJEZWJ1Z2dlci5zZW5kQ29tbWFuZCgnQ1NTLmdldENvbXB1dGVkU3R5bGVGb3JOb2RlJywge1xuICAgICAgbm9kZUlkXG4gICAgfSkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgbGV0IGl0ZW0gPSBkYXRhLmNvbXB1dGVkU3R5bGUuZmluZCgoaXRlbSkgPT4ge1xuICAgICAgICByZXR1cm4gaXRlbS5uYW1lID09PSBwcm9wZXJ0eTtcbiAgICAgIH0pO1xuXG4gICAgICBpZihpdGVtKSB7XG4gICAgICAgIHJldHVybiBwcm9wZXJ0eSArICcgdmFsdWUgaXMgJyArIGZyb21DU1NWYWx1ZVRvVGV4dChpdGVtLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAnUHJvcGVydHkgJyArIHByb3BlcnR5ICsgJyBub3QgZm91bmQuJztcbiAgICAgIH1cbiAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vZGUgbm90IGZvdW5kLicpO1xuICAgIH0pO1xuICB9XG59XG5cbkNTU0dldFZhbHVlQ29tbWFuZC5kZXNjcmlwdGlvbiA9IGBHZXQgY29tcHV0ZWQgQ1NTIHByb3BlcnR5IHZhbHVlIG9mIGN1cnJlbnRseSBpbnNwZWN0ZWQgbm9kZSBieSBzYXlpbmcgXCJnZXQgaXRzIHhcIiBvciBcIndoYXQncyBpdHMgeFwiICh3aGVyZSBcInhcIiBpcyB0aGUgbmFtZSBvZiB0aGUgQ1NTIHByb3BlcnR5KS5gO1xuXG5leHBvcnQgZGVmYXVsdCBDU1NHZXRWYWx1ZUNvbW1hbmQ7IiwiaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vY29tbWFuZC5qcyc7XG5cbmNsYXNzIE5vZGVEZWxldGlvbkNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcbiAgY29uc3RydWN0b3IoY29tbWFuZFJ1bm5lcikge1xuICAgIHN1cGVyKGNvbW1hbmRSdW5uZXIpO1xuICAgIHRoaXMuX3JlZ2V4ID0gLyhkZWxldGV8cmVtb3ZlKSBpdC9pO1xuICB9XG5cbiAgZXhlY3V0ZSh0ZXh0LCB0YWJEZWJ1Z2dlciwgY29tbWFuZENvbnRleHQpIHtcbiAgICBsZXQgbWF0Y2hlcyA9IHRleHQubWF0Y2godGhpcy5fcmVnZXgpO1xuXG4gICAgaWYobWF0Y2hlcykge1xuICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlTm9kZShjb21tYW5kQ29udGV4dC5nZXRDb250ZXh0Tm9kZUlkKCksIHRhYkRlYnVnZ2VyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgcmVqZWN0KCdUZXh0IGRvZXNuXFwndCBtYXRjaCB0aGUgY29tbWFuZC4nKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZU5vZGUobm9kZUlkLCB0YWJEZWJ1Z2dlcikge1xuICAgIGNvbnNvbGUubG9nKCdOb2RlRGVsZXRpb25Db21tYW5kJywgbm9kZUlkKTtcblxuICAgIGlmKCFub2RlSWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb250ZXh0LicpO1xuICAgIH1cblxuICAgIHJldHVybiB0YWJEZWJ1Z2dlci5zZW5kQ29tbWFuZCgnRE9NLnJlbW92ZU5vZGUnLCB7XG4gICAgICBub2RlSWRcbiAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgIC8vYWxsb3cgdW5kb2luZyBub2RlIHJlbW92YWxcbiAgICAgIHRhYkRlYnVnZ2VyLnNlbmRDb21tYW5kKCdET00ubWFya1VuZG9hYmxlU3RhdGUnKTtcbiAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vZGUgbm90IGZvdW5kLicpO1xuICAgIH0pO1xuICB9XG59XG5cbk5vZGVEZWxldGlvbkNvbW1hbmQuZGVzY3JpcHRpb24gPSBgUmVtb3ZlIGN1cnJlbnRseSBpbnNwZWN0ZWQgbm9kZSB3aXRoIFwicmVtb3ZlIGl0XCIgb3IgXCJkZWxldGUgaXRcIi5gO1xuXG5leHBvcnQgZGVmYXVsdCBOb2RlRGVsZXRpb25Db21tYW5kOyIsImltcG9ydCBDb21tYW5kIGZyb20gJy4uL2NvbW1hbmQuanMnO1xuXG5jb25zdCBISUdITElHSFRfQ09MT1IgPSB7XG4gIHI6IDE1NSxcbiAgZzogMTEsXG4gIGI6IDIzOSxcbiAgYTogMC43XG59O1xuY29uc3QgSElHSExJR0hUX1RJTUVPVVQgPSAyMDAwO1xuXG5jbGFzcyBOb2RlSW5zcGVjdGlvbkNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcbiAgY29uc3RydWN0b3IoY29tbWFuZFJ1bm5lcikge1xuICAgIHN1cGVyKGNvbW1hbmRSdW5uZXIpO1xuICAgIHRoaXMuX3JlZ2V4ID0gLyhzZWxlY3R8aW5zcGVjdCkgKFxcdyspL2k7XG4gIH1cblxuICBleGVjdXRlKHRleHQsIHRhYkRlYnVnZ2VyLCBjb21tYW5kQ29udGV4dCkge1xuICAgIGxldCBtYXRjaGVzID0gdGV4dC5tYXRjaCh0aGlzLl9yZWdleCk7XG5cbiAgICBpZiAobWF0Y2hlcykge1xuICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0Tm9kZShtYXRjaGVzWzJdICsgJywgIycgKyBtYXRjaGVzWzJdICsgJywgLicgKyBtYXRjaGVzWzJdLCB0YWJEZWJ1Z2dlciwgY29tbWFuZENvbnRleHQpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZWplY3QoJ1RleHQgZG9lc25cXCd0IG1hdGNoIHRoZSBjb21tYW5kLicpO1xuICAgIH0pO1xuICB9XG5cbiAgc2VsZWN0Tm9kZShzZWxlY3RvciwgdGFiRGVidWdnZXIsIGNvbW1hbmRDb250ZXh0KSB7XG4gICAgY29uc29sZS5sb2coJ05vZGVJbnNwZWN0aW9uQ29tbWFuZCcsIHNlbGVjdG9yKTtcblxuICAgIGxldCByb290Tm9kZUlkID0gY29tbWFuZENvbnRleHQuZ2V0Um9vdE5vZGVJZCgpO1xuXG4gICAgcmV0dXJuIHRhYkRlYnVnZ2VyLnNlbmRDb21tYW5kKCdET00ucXVlcnlTZWxlY3RvcicsIHtcbiAgICAgIG5vZGVJZDogcm9vdE5vZGVJZCxcbiAgICAgIHNlbGVjdG9yXG4gICAgfSkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgLy93aGVuIG5vIHJlc3VsdHMgQVBJIHJldHVybnMgbm9kZUlkID09PSAwXG4gICAgICBpZighZGF0YS5ub2RlSWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb2RlIG5vdCBmb3VuZC4nKTtcbiAgICAgIH1cblxuICAgICAgY29tbWFuZENvbnRleHQuc2V0Q29udGV4dE5vZGVJZChkYXRhLm5vZGVJZCk7XG4gICAgICBjb21tYW5kQ29udGV4dC5zZXRDb250ZXh0Q1NTUHJvcGVydHlOYW1lKG51bGwpO1xuXG4gICAgICByZXR1cm4gdGFiRGVidWdnZXIuc2VuZENvbW1hbmQoJ0RPTS5oaWdobGlnaHROb2RlJywge1xuICAgICAgICBoaWdobGlnaHRDb25maWc6IHtcbiAgICAgICAgICBjb250ZW50Q29sb3I6IEhJR0hMSUdIVF9DT0xPUixcbiAgICAgICAgICBzaG93SW5mbzogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBub2RlSWQ6IGRhdGEubm9kZUlkXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgLy9zdG9wIGhpZ2hsaWdodGluZyBhZnRlciBjb3VwbGUgb2Ygc2Vjb25kc1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0YWJEZWJ1Z2dlci5zZW5kQ29tbWFuZCgnRE9NLmhpZGVIaWdobGlnaHQnKTtcbiAgICAgICAgfSwgSElHSExJR0hUX1RJTUVPVVQpO1xuICAgICAgfSk7XG4gICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb2RlIG5vdCBmb3VuZC4nKTtcbiAgICB9KTtcbiAgfVxufVxuXG5Ob2RlSW5zcGVjdGlvbkNvbW1hbmQuZGVzY3JpcHRpb24gPSBgU2VsZWN0IERPTSBub2RlcyB3aXRoIFwic2VsZWN0IHhcIiBvciBcImluc3BlY3QgeFwiICh3aGVyZSBcInhcIiBpcyB0aGUgbmFtZSBvZiB0aGUgdGFnLCBpZCBvciBDU1MgY2xhc3MpLiBJZiBtdWx0aXBsZSBub2RlcyBtYXRjaCwgb25seSB0aGUgZmlyc3Qgb25lIHdpbGwgYmUgc2VsZWN0ZWQuYDtcblxuZXhwb3J0IGRlZmF1bHQgTm9kZUluc3BlY3Rpb25Db21tYW5kOyIsImltcG9ydCBDb21tYW5kIGZyb20gJy4uL2NvbW1hbmQuanMnO1xuXG5jbGFzcyBSZWRvQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuICBjb25zdHJ1Y3Rvcihjb21tYW5kUnVubmVyKSB7XG4gICAgc3VwZXIoY29tbWFuZFJ1bm5lcik7XG4gICAgdGhpcy5fcmVnZXggPSAvcmVkby9pO1xuICB9XG5cbiAgZXhlY3V0ZSh0ZXh0LCB0YWJEZWJ1Z2dlciwgY29tbWFuZENvbnRleHQpIHtcbiAgICBsZXQgbWF0Y2hlcyA9IHRleHQubWF0Y2godGhpcy5fcmVnZXgpO1xuXG4gICAgaWYobWF0Y2hlcykge1xuICAgICAgcmV0dXJuIHRoaXMucmVkb0xhc3RBY3Rpb24odGFiRGVidWdnZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZWplY3QoJ1RleHQgZG9lc25cXCd0IG1hdGNoIHRoZSBjb21tYW5kLicpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVkb0xhc3RBY3Rpb24odGFiRGVidWdnZXIpIHtcbiAgICBjb25zb2xlLmxvZygnUmVkb0NvbW1hbmQnKTtcblxuICAgIHJldHVybiB0YWJEZWJ1Z2dlci5zZW5kQ29tbWFuZCgnRE9NLnJlZG8nKTtcbiAgfVxufVxuXG5SZWRvQ29tbWFuZC5kZXNjcmlwdGlvbiA9IGBSZWRvIGxhc3QgY29tbWFuZCB3aXRoIFwicmVkb1wiLmA7XG5cbmV4cG9ydCBkZWZhdWx0IFJlZG9Db21tYW5kOyIsImltcG9ydCBDb21tYW5kIGZyb20gJy4uL2NvbW1hbmQuanMnO1xuXG5jbGFzcyBVbmRvQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuICBjb25zdHJ1Y3Rvcihjb21tYW5kUnVubmVyKSB7XG4gICAgc3VwZXIoY29tbWFuZFJ1bm5lcik7XG4gICAgdGhpcy5fcmVnZXggPSAvdW5kby9pO1xuICB9XG5cbiAgZXhlY3V0ZSh0ZXh0LCB0YWJEZWJ1Z2dlciwgY29tbWFuZENvbnRleHQpIHtcbiAgICBsZXQgbWF0Y2hlcyA9IHRleHQubWF0Y2godGhpcy5fcmVnZXgpO1xuXG4gICAgaWYobWF0Y2hlcykge1xuICAgICAgcmV0dXJuIHRoaXMudW5kb0xhc3RBY3Rpb24odGFiRGVidWdnZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZWplY3QoJ1RleHQgZG9lc25cXCd0IG1hdGNoIHRoZSBjb21tYW5kLicpO1xuICAgIH0pO1xuICB9XG5cbiAgdW5kb0xhc3RBY3Rpb24odGFiRGVidWdnZXIpIHtcbiAgICBjb25zb2xlLmxvZygnVW5kb0NvbW1hbmQnKTtcblxuICAgIHJldHVybiB0YWJEZWJ1Z2dlci5zZW5kQ29tbWFuZCgnRE9NLnVuZG8nKTtcbiAgfVxufVxuXG5VbmRvQ29tbWFuZC5kZXNjcmlwdGlvbiA9IGBVbmRvIGxhc3QgY29tbWFuZCB3aXRoIFwidW5kb1wiLmA7XG5cbmV4cG9ydCBkZWZhdWx0IFVuZG9Db21tYW5kOyIsImltcG9ydCBOb2RlSW5zcGVjdGlvbkNvbW1hbmQgZnJvbSAnLi9saWIvY29tbWFuZHMvbm9kZS1pbnNwZWN0aW9uLmpzJztcbmltcG9ydCBOb2RlRGVsZXRpb25Db21tYW5kIGZyb20gJy4vbGliL2NvbW1hbmRzL25vZGUtZGVsZXRpb24uanMnO1xuaW1wb3J0IENTU0NoYW5nZUNvbW1hbmQgZnJvbSAnLi9saWIvY29tbWFuZHMvY3NzLWNoYW5nZS5qcyc7XG5pbXBvcnQgQ1NTR2V0VmFsdWVDb21tYW5kIGZyb20gJy4vbGliL2NvbW1hbmRzL2Nzcy1nZXQtdmFsdWUuanMnO1xuaW1wb3J0IFVuZG9Db21tYW5kIGZyb20gJy4vbGliL2NvbW1hbmRzL3VuZG8uanMnO1xuaW1wb3J0IFJlZG9Db21tYW5kIGZyb20gJy4vbGliL2NvbW1hbmRzL3JlZG8uanMnO1xuXG5mdW5jdGlvbiBpbml0U3BlZWNoUmVjb2duaXRpb24oKSB7XG4gIGxldCByZWNvZ25pdGlvbiA9IG5ldyB3ZWJraXRTcGVlY2hSZWNvZ25pdGlvbigpO1xuICBsZXQgZXJyb3JOb2RlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmVycm9yJyk7XG4gIGxldCBsb2FkaW5nU2NyZWVuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxvYWRpbmcnKTtcbiAgbGV0IGFza1NjcmVlbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hc2snKTtcbiAgbGV0IHN1Y2Nlc3NTY3JlZW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc3VjY2VzcycpO1xuXG4gIHJlY29nbml0aW9uLm9uc3RhcnQgPSAoKSA9PiB7XG4gICAgbG9hZGluZ1NjcmVlbi5oaWRkZW4gPSB0cnVlO1xuICAgIGFza1NjcmVlbi5oaWRkZW4gPSB0cnVlO1xuICAgIHN1Y2Nlc3NTY3JlZW4uaGlkZGVuID0gZmFsc2U7XG5cbiAgICByZWNvZ25pdGlvbi5zdG9wKCk7XG4gIH07XG4gIHJlY29nbml0aW9uLm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICBlcnJvck5vZGUuaW5uZXJUZXh0ID0gXCJVcHMhIFNvbWV0aGluZyB3ZW50IHdyb25nLCB3ZSBnb3QgdGhpcyBlcnJvciBiYWNrOiBcIiArIGV2ZW50LmVycm9yO1xuICB9O1xuXG4gIHJlY29nbml0aW9uLnN0YXJ0KCk7XG5cbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgaWYoIWxvYWRpbmdTY3JlZW4uaGlkZGVuKSB7XG4gICAgICBsb2FkaW5nU2NyZWVuLmhpZGRlbiA9IHRydWU7XG4gICAgICBhc2tTY3JlZW4uaGlkZGVuID0gZmFsc2U7XG4gICAgfVxuICB9LCAzMDApO1xufVxuXG5mdW5jdGlvbiBpbml0TGlzdE9mVm9pY2VzKCkge1xuICBsZXQgdm9pY2VTZWxlY3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdm9pY2UnKTtcblxuICB2b2ljZVNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgbGV0IHZvaWNlTmFtZSA9IHZvaWNlU2VsZWN0LnZhbHVlO1xuXG4gICAgaWYodm9pY2VOYW1lICE9PSAnJykge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3ZvaWNlTmFtZScsIHZvaWNlTmFtZSk7XG4gICAgICBjaHJvbWUudHRzLnNwZWFrKHZvaWNlTmFtZSArICcgdm9pY2Ugc2VsZWN0ZWQuJywge3ZvaWNlTmFtZX0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd2b2ljZU5hbWUnKTtcbiAgICAgIGNocm9tZS50dHMuc3BlYWsoJ0RlZmF1bHQgdm9pY2Ugc2VsZWN0ZWQuJyk7XG4gICAgfVxuICB9KTtcblxuICBjaHJvbWUudHRzLmdldFZvaWNlcygobGlzdCkgPT4ge1xuICAgIGxpc3QuZmlsdGVyKCh2b2ljZSkgPT4ge1xuICAgICAgcmV0dXJuICh2b2ljZS5sYW5nLnN1YnN0cigwLDMpID09PSAnZW4tJyk7XG4gICAgfSkuZm9yRWFjaCgodm9pY2UpID0+IHtcbiAgICAgIGxldCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICAgIG9wdGlvbi5pbm5lclRleHQgPSB2b2ljZS52b2ljZU5hbWU7XG5cbiAgICAgIGlmKHZvaWNlLnZvaWNlTmFtZSA9PT0gbG9jYWxTdG9yYWdlLnZvaWNlTmFtZSkge1xuICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICB2b2ljZVNlbGVjdC5hcHBlbmRDaGlsZChvcHRpb24pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gaW5pdExpc3RPZkNvbW1hbmRzKCkge1xuICBsZXQgY29tbWFuZHNMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvbW1hbmRzJyk7XG5cbiAgW1xuICAgIE5vZGVJbnNwZWN0aW9uQ29tbWFuZCxcbiAgICBOb2RlRGVsZXRpb25Db21tYW5kLFxuICAgIENTU0NoYW5nZUNvbW1hbmQsXG4gICAgQ1NTR2V0VmFsdWVDb21tYW5kLFxuICAgIFVuZG9Db21tYW5kLFxuICAgIFJlZG9Db21tYW5kXG4gIF0uZm9yRWFjaCgoY29tbWFuZCkgPT4ge1xuICAgICAgbGV0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgIGxpLmlubmVyVGV4dCA9IGNvbW1hbmQuZGVzY3JpcHRpb247XG5cbiAgICAgIGNvbW1hbmRzTGlzdC5hcHBlbmRDaGlsZChsaSk7XG4gICAgfSk7XG59XG5cbmluaXRTcGVlY2hSZWNvZ25pdGlvbigpO1xuaW5pdExpc3RPZlZvaWNlcygpO1xuaW5pdExpc3RPZkNvbW1hbmRzKCk7Il19
