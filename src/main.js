import HelloWorld from './components/HelloWorld.html';

/**
 * @type {HelloWorld}
 */
const app = new HelloWorld({
  target: document.querySelector( '#main' ),
  data: { name: 'world' }
});

// change the data associated with the template
app.set({ name: 'everybody' });

// detach the component and clean everything up
app.teardown();