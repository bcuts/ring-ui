/**
 * @fileoverview Tests of alerts stack component.
 * @author igor.alexeenko@jetbrains.com (Igor Alexeenko)
 */

var Alerts = require('./alerts');
var React = require('react/addons');
var when = require('when');

describe('Alerts', function() {
  /** @type {Alerts} */
  var component;

  beforeEach(function() {
    component = React.addons.TestUtils.renderIntoDocument(React.createElement(Alerts, null));
  });

  it('should render alerts component', function() {
    component.should.be.defined;
    component.getDOMNode().should.be.an.instanceof(HTMLElement);
  });

  describe('adding alerts', function() {
    it('should add alert', function() {
      component._addElement('Child element.', Alerts.Type.MESSAGE, when.defer());

      return component.animationPromise.then(function () {
        return component.state.childElements.should.have.length(1);
      });
    });

    it('should add alert with React component child', function() {
      component._addElement(React.DOM.a(null, React.DOM.b(null, 'Composite element')), Alerts.Type.MESSAGE, when.defer());

      return component.animationPromise.then(function () {
        return component.state.childElements.should.have.length(1);
      });
    });


    it('should return deferred object', function() {
      var added = component.add('Child element');
      var deferred = when.defer();
      added.should.be.instanceof(deferred.constructor);
    });

    it('should render alerts in a reversed order. Last added alerts goes first.', function() {
      var LAST_TEXT = 'Last component';

      component._addElement('First', Alerts.Type.MESSAGE, when.defer());
      component._addElement(LAST_TEXT, Alerts.Type.MESSAGE, when.defer());

      var domElement = component.getDOMNode();
      var children = domElement.querySelectorAll('.ring-alert');

      children[0].textContent.should.equal(LAST_TEXT);
    });
  });

  describe('removing alerts', function() {
    it('should remove alert', function() {
      component._addElement('Child element.', Alerts.Type.MESSAGE, when.defer());
      component.remove(component.state.childElements[0]);

      component.state.childElements.should.have.length(0);
    });

    it('should remove alert by clicking on close button', function() {
      component._addElement('Child element.', Alerts.Type.MESSAGE, when.defer());
      var clickElement = component.getDOMNode().querySelector('.ring-alert__close');
      React.addons.TestUtils.Simulate.click(clickElement, {});

      component.state.childElements.should.have.length(0);
    });

    it('should not remove alert by calling close() method of alert component', function() {
      component._addElement('Child element.', Alerts.Type.MESSAGE, when.defer());
      var addedComponent = component.refs['alert-0'];
      expect(addedComponent.close).to.throw(Error);
    });

    it('should remove alert after timeout', function(done) {
      var TIMEOUT = 100;
      component._addElement('Child element.', Alerts.Type.MESSAGE, when.defer(), TIMEOUT);

      // Before timeout component exists.
      component.state.childElements.should.not.be.undefined;

      setTimeout(function() {
        // After timeout component is deleted.
        expect(component.state.childElements[0]).to.be.undefined;
        done();
      }, TIMEOUT);
    });
  });
});
