import ReadMessagesRoute from './../read_messages';

export default ReadMessagesRoute.extend({

  renderTemplate: function() {
    this.render('message_template', {controller: 'review_item.donor_messages'});
  },

  model: function() {
    var itemId = this.modelFor('reviewItem').get('id');

    return this.store.filter('message', function(message) {
      return message.get('item.id') === itemId && message.get('isPrivate') === false;
    });
  },

  setupController: function(controller, model){
    this._super(controller, model);
    controller.set('vesrions', this.store.all('version'));
  }
});
