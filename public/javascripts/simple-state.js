/*
 * Example:
 *    var = myStates = SimpleState({
 *      disabled: {
 *        on: function () {
 *          // do something when state enters
 *        },
 *        off: function () {
 *          // do something when state leaves
 *        }
 *      },
 *      enabled: {
 *        // state on and off
 *      }
 *    },'default'); // set default state
 */
window.SimpleState = (function (window, undefined) {

    function callStateMethod (state, method, args) {
        if (!state) return false;
        if (!!state[method]) {
            state[method].apply(window, args);
        }
    }
    // constructor
    function State (states, defaultStateKey) {
        this.states = states;
        this.currentStateKey = defaultStateKey;
        callStateMethod(this.states[this.currentStateKey], 'on');
    }
    State.prototype.setState = function () {
        var newStateKey = Array.prototype.shift.call(arguments);
        if (!this.states[newStateKey]) return false;
        callStateMethod(this.states[this.currentStateKey],'off');
        this.currentStateKey = newStateKey;
        callStateMethod(this.states[this.currentStateKey],'on', arguments);
    }
    State.prototype.getState = function () {
        return this.currentStateKey;
    }

    return function (states, defaultStateKey) {
        return new State(states, defaultStateKey);
    };

})(window);
