///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define([
  "dojo",
  "dijit",
  "dijit/_editor/_Plugin",
  "jimu/dijit/ImageChooser",
  "dojo/_base/html",
  'dojo/_base/lang',
  //"dojo/sniff",
  "dojo/i18n",
  "dojo/_base/connect",
  "dojo/_base/declare"
], function(
  dojo, dijit, _Plugin, ImageChooser, html, lang, /*has, */i18n
) {
  dojo.experimental("dojox.editor.plugins.ChooseImage");

  var ChooseImage = dojo.declare("dojox.editor.plugins.ChooseImage", _Plugin, {
    iconClassPrefix: "editorIcon",
    useDefaultCommand: false,

    _initButton: function() {
      this.createFileInput();
      this.command = "chooseImage";

      var strings = i18n.getLocalization("dijit._editor", "commands");
      this.button = new dijit.form.Button({
        label: strings.insertImage,
        showLabel: false,
        iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "UploadImage",
        tabIndex: "-1",
        onClick: lang.hitch(this, this._chooseImage)
      });
      this.button.set("readOnly", false);

      this.editor.commands[this.command] = "Upload Image";
      this.inherited("_initButton", arguments);
      delete this.command;
    },

    updateState: function() {
      //change icon ,when "viewsource" dijit clicked
      var disabled = this.get("disabled");
      this.button.set("disabled",this.get("disabled"));
      if (true === disabled) {
        html.addClass(this.button, 'dijitButtonDisabled');
        this.imageChooser.disableChooseImage();
      } else {
        html.removeClass(this.button, 'dijitButtonDisabled');
        this.imageChooser.enableChooseImage();
      }
    },

    createFileInput: function() {
      var node = dojo.create('span', {
        innerHTML: "."
      }, document.body);
      this.imageChooser = new ImageChooser({
        showSelfImg: false,
        cropImage: false,
        format: [ImageChooser.GIF, ImageChooser.JPEG, ImageChooser.PNG]
      }, node);

      this.connect(this.imageChooser, "onImageChange", "insertTempImage");
      // this.connect(this.button, "onComplete", "onComplete");
    },

    _chooseImage: function () {
      html.setStyle(this.imageChooser.domNode, 'display', 'none');
      this.imageChooser.triggerImgUpload();
    },

    onComplete: function(data /*,ioArgs,widgetRef*/ ) {
      data = data[0];
      // Image is ready to insert
      var tmpImgNode = dojo.byId(this.currentImageId, this.editor.document);
      var file;
      // download path is mainly used so we can access a PHP script
      // not relative to this file. The server *should* return a qualified path.
      if (this.downloadPath) {
        file = this.downloadPath + data.name;
      } else {
        file = data.file;
      }

      tmpImgNode.src = file;
      dojo.attr(tmpImgNode, '_djrealurl', file);

      if (data.width) {
        tmpImgNode.width = data.width;
        tmpImgNode.height = data.height;
      }
    },

    insertTempImage: function(fileData, fileProperty) {
      //add alt property for screen readers.
      var imgAlt = (fileProperty && fileProperty.fileName) ? 'alt="' + fileProperty.fileName + '"' : '';
      // summary:
      //    inserting a "busy" image to show something is hapening
      //    during upload and download of the image.
      this.currentImageId = "img_" + (new Date().getTime());
      var iTxt = '<img id="' + this.currentImageId + '" src="' + fileData + '" ' + imgAlt + '/>';
      this.editor.execCommand('inserthtml', iTxt);
    },

    destroy: function () {
      if (this.imageChooser) {
        this.imageChooser.destroy();
      }

      this.inherited(arguments);
    }
  });

  dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function(o) {
    if (o.plugin) {
      return;
    }
    switch (o.args.name) {
      case "chooseImage":
        o.plugin = new ChooseImage({
          url: o.args.url
        });
    }
  });

  /*jshint sub: true */
  _Plugin.registry["chooseImage"] = function(args){
    return new ChooseImage(args);
  };

  return ChooseImage;
});