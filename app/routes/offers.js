import AuthorizeRoute from './authorize';

export default AuthorizeRoute.extend({
  staffRestricted: true,

  model: function() {
    return this.store.filter('offer', function(offer) {
      return offer.get('state') === 'submitted';
    });
  },

  renderTemplate: function() {
    this.render(); // default template
    this.render('appMenuList', {
      into: 'offers',
      outlet: 'appMenuList',
      controller: 'offers'
    });

    this.render('unreadNotificationsCount', {
      into: 'offers',
      outlet: 'unreadNotificationsCount',
      controller: 'offers'
    });
  }
});
