import Ember from "ember";
import config from '../config/environment';
export default Ember.Component.extend({

  store:        Ember.inject.service(),
  isCordovaApp: config.cordova.enabled,

  animateNotification: Ember.observer('currentController.model.[]', function () {
    var box = Ember.$(".contain-to-grid.notification");
    let notification = this.get("currentController").retrieveNotification();

    if(!notification){
      box.hide();
      return;
    }

    if(!this.get("isCordovaApp") && !this.iOS()){
      this.desktopNotification(notification);
    }

    if(box.is(":hidden")) {
      box.slideDown();
      Ember.$(".sticky_title_bar").animate({
            top : '5%'
        }, 1000);
      Ember.run.later(this, this.removeNotification, notification, 6000);
    }
  }).on("didInsertElement"),

  iOS: function() {
    var iDevices = [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ];

    if (!!navigator.platform) {
      while (iDevices.length) {
        if (navigator.platform === iDevices.pop()){ return true; }
      }
    }

    return false;
  },

  removeNotification: function(notification) {
    var controller = this.get("currentController");
    if(controller) {
      var remove = function() { controller.get("model").removeObject(notification); };
      var newNotification =  controller.retrieveNotification(1);
      if(newNotification) {
        remove();
        Ember.run.later(this, this.removeNotification, newNotification, 6000);
      } else {
        Ember.$(".contain-to-grid.notification").slideUp(1000, remove);
        Ember.$(".sticky_title_bar").animate({
              top : '0'
          }, 1000);
      }
    }
  },

  desktopNotification: function(data){
    if(Notification.permission === "granted") {
      var text = data.message;
      if(data.category === "message"){
        let user = this.get('store').peekRecord('user', data.author_id);
        text = "New "+data.category+" from "+user.get('firstName')+" "+
            user.get('lastName')+"\n"+ data.message ;
      }
      this.sendDesktopNotification(text);
    }
  },

  sendDesktopNotification: function(text){
    let notification = new Notification('Goodcity Admin', {
      icon: 'https://www.goodcity.hk/assets/images/Global-Distribution_logo.gif',
      body:  text,
      tag: 'soManyNotification'
    });
    //'tag' handles muti tab scenario i.e when multiple tabs are open then only
    // only one notification is sent

    notification.onclick = function () {
      parent.focus();
      window.focus(); //just in case, older browsers
      this.close();
    };
    setTimeout(notification.close.bind(notification), 3000);
  }

});
