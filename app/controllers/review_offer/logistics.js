import Ember from 'ember';
import AjaxPromise from './../../utils/ajax-promise';
import config from './../../config/environment';
import transportDetails from './../offer/transport_details';

export default transportDetails.extend({
  needs: ['review_offer'],

  accepted: Ember.computed.filterBy('model.items', 'state', 'accepted'),
  pendingItem: Ember.computed.filterBy('model.items', 'state', 'submitted'),
  crossroadsOptionsPrompt: Ember.I18n.t("select"),

  selectedCrossroadsOption: function(){
    var options = this.get('crossroadsOptions').filter(function(option){
      return option.get('name') === Ember.I18n.t("offer.disable");
    });
    return options.get('firstObject');
  }.property('crossroadsOptions'),

  selectedGogovanOption: function(){
    var options = this.get('gogovanOptions').filter(function(option){
      return option.get('name') === Ember.I18n.t("logistics.9t_truck");
    });
    return options.get('firstObject.id');
  }.property('gogovanOptions'),

  gogovanOptions: function() {
    var allOptions = this.store.all('gogovan_transport');
    var options = allOptions.rejectBy('isDisabled', true).sortBy('id');
    var disabledOption = allOptions.filterBy('isDisabled', true);
    return options.concat(disabledOption);
  }.property(),

  crossroadsOptions: function() {
    return this.store.all('crossroads_transport').sortBy('name');
  }.property(),

  ggvDriverUrl: function() {
    var language = this.get("session.language");
    var isAdmin = this.get("session.isAdminApp");
    var uuid = this.get("model.delivery.gogovanOrder.ggvUuid");
    var url = config.DONOR_APP_HOST_URL+"/ggv_orders/"+uuid;
    var params = [];
    if(language) { params.push("ln="+language); }
    if(isAdmin) { params.push("gcadmin="+isAdmin); }
    if(params.length) { url = url + "?" + params.join("&"); }
    return url;
  }.property("model"),

  actions: {

    completeReview: function() {
      var gogovanOptionId = this.get('selectedGogovanOption');
      var crossroadsOptionId = this.get('selectedCrossroadsOption.id');
      var loadingView = this.container.lookup('view:loading').append();
      var offerId = this.get('model.id');

      var offerProperties = {
        gogovan_transport_id: gogovanOptionId,
        crossroads_transport_id: crossroadsOptionId,
        state_event: 'finish_review',
        id: offerId
      };

      var url   = "/offers/" + offerId + "/complete_review";

      new AjaxPromise(url, "PUT", this.get('session.authToken'), {offer: offerProperties})
        .then(data => {
          this.store.pushPayload(data);
          this.transitionToRoute('review_offer.items');
        })
        .finally(() => loadingView.destroy());
    },

    closeOffer: function(){
      this.get('controllers.review_offer').send('closeOffer');
    }
  }
});
