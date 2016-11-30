/**
 * @typedef {{
     *  name: (string|undefined)
     * }}
 */
var HelloWorldState;
/**
 * @typedef {{
     *  update: function(HelloWorldState,HelloWorldState),
     *  teardown: function(boolean)
     * }}
 */
var RenderedMainFragment;


/**
 *
 * @typedef {function(this:HelloWorld, *, *=)}
 * @property {boolean} __calling
 */
var helloWorldObserver;

/**
 *
 * @typedef {function(this:HelloWorld,*=)}
 */
var helloWorldCallback;

/**
 * @enum {string}
 *
 */
var HelloWorldEventName = {
    teardown: "teardown"
};

/**
 * @typedef {{
     *  data: HelloWorldState,
     *  target : Element
     *  }}
 */
var HelloWorldOptions;


/**
 *
 * @param {HelloWorldState} root
 * @param {HelloWorld} component
 * @param {Element} target
 * @returns {RenderedMainFragment}
 */
function renderMainFragment(root, component, target) {
    /**
     *
     * @type {HTMLHeadingElement}
     */
    var h1 = /** @type {HTMLHeadingElement} */(document.createElement('h1'));

    /**
     *
     * @type {Text}
     */
    var text = document.createTextNode("Hello ");
    h1.appendChild(text);

    /**
     *
     * @type {Text}
     */
    var text1 = document.createTextNode(root.name||"");
    h1.appendChild(text1);

    target.appendChild(h1);

    return {

        update: function (changed, root) {
            text1.data = root.name;
        },

        teardown: function (detach) {
            if (detach) h1.parentNode.removeChild(h1);

            text.parentNode.removeChild(text);
        }
    };
}


/**
 *
 * @param {HelloWorldOptions} options
 * @constructor
 */
function HelloWorld(options) {
    /**
     *
     * @type {HelloWorld}
     */
    var component = this;
    /**
     *
     * @type {HelloWorldState}
     */
    var state = options.data || {};
    /**
     *
     * @type {{
         *  immediate: Object<string,Array<helloWorldObserver>> ,
         *  deferred: Object<string,Array<helloWorldObserver>>
         * }}
     */
    var observers = {
        immediate: Object.create(null),
        deferred: Object.create(null)
    };
    /**
     *
     * @type {Object<string,Array<helloWorldCallback>>}
     */
    var callbacks = Object.create(null);

    /**
     *
     * @param {Object<string,Array<helloWorldObserver>>} group
     * @param {HelloWorldState} newState
     * @param {HelloWorldState} oldState
     */
    function dispatchObservers(group, newState, oldState) {
        for (const key in group) {
            if (!( key in newState )) continue;

            const newValue = newState[key];
            const oldValue = oldState[key];

            if (newValue === oldValue && typeof newValue !== 'object') continue;
            /**
             *
             * @type {Array.<helloWorldObserver>}
             */
            const callbacks = group[key];
            if (!callbacks) continue;

            for (let i = 0; i < callbacks.length; i += 1) {
                /**
                 *
                 * @type {helloWorldObserver}
                 */
                const callback = callbacks[i];
                if (callback.__calling) continue;

                callback.__calling = true;
                callback.call(component, newValue, oldValue);
                callback.__calling = false;
            }
        }
    }

    /**
     *
     * @param {HelloWorldEventName} eventName
     * @param {*=} data
     */
    this.fire = function fire(eventName, data) {

        /**
         *
         * @type {Array<helloWorldCallback>|boolean}
         */
        var handlers = eventName in callbacks && callbacks[eventName].slice();
        if (!handlers) return;

        for (var i = 0; i < handlers.length; i += 1) {
            handlers[i].call(this, data);
        }
    };
    /**
     * @param {string} key
     * @returns {*}
     */
    this.get = function get(key) {
        return state[key];
    };

    /**
     *
     * @param {HelloWorldState} newState
     */
    this.set = function set(newState) {
        const oldState = state;
        state = Object.assign({}, oldState, newState);

        dispatchObservers(observers.immediate, newState, oldState);
        if (mainFragment) mainFragment.update(newState, state);
        dispatchObservers(observers.deferred, newState, oldState);
    };
    /**
     *
     * @param {string} key
     * @param {helloWorldObserver} callback
     * @param {{init: (boolean|undefined), defer: (boolean|undefined)}} options
     * @returns {{cancel: (function())}}
     */
    this.observe = function (key, callback, options = {}) {
        /**
         *
         * @type {Object<string,Array<helloWorldObserver>>}
         */
        const group = options.defer ? observers.deferred : observers.immediate;

        ( group[key] || ( group[key] = [] ) ).push(callback);

        if (options.init !== false) {
            callback.__calling = true;
            callback.call(component, state[key]);
            callback.__calling = false;
        }

        return {
            cancel () {
                const index = group[key].indexOf(callback);
                if (~index) group[key].splice(index, 1);
            }
        };
    };
    /**
     *
     * @param {string} eventName
     * @param {helloWorldCallback} handler
     * @returns {{cancel: function()}}
     */
    this.on = function on(eventName, handler) {
        /**
         *
         * @type {Array<helloWorldCallback>}
         */
        const handlers = callbacks[eventName] || ( callbacks[eventName] = [] );
        handlers.push(handler);

        return {
            cancel: function () {
                const index = handlers.indexOf(handler);
                if (~index) handlers.splice(index, 1);
            }
        };
    };
    /**
     *
     * @param {boolean=} detach
     */
    this.teardown = function teardown(detach) {
        this.fire(HelloWorldEventName.teardown);

        mainFragment.teardown(detach !== false);
        mainFragment = null;

        state = {};
    };
    /**
     *
     * @type {RenderedMainFragment|null}
     */
    var mainFragment = renderMainFragment(state, this, options.target);
}

/**
 * @type {HelloWorld}
 */
const app = new HelloWorld({
    target: document.querySelector('#main'),
    data: {name: 'world'}
});

// change the data associated with the template
app.set({name: 'everybody'});

// detach the component and clean everything up
app.teardown();


