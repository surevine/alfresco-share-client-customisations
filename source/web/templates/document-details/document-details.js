/*
 * Copyright (C) 2008-2010 Surevine Limited.
 *   
 * Although intended for deployment and use alongside Alfresco this module should
 * be considered 'Not a Contribution' as defined in Alfresco'sstandard contribution agreement, see
 * http://www.alfresco.org/resource/AlfrescoContributionAgreementv2.pdf
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/
/**
 * DocumentDetails template.
 * 
 * @namespace Alfresco
 * @class Alfresco.DocumentDetails
 */
(function()
{
   /**
    * DocumentDetails constructor.
    * 
    * @return {Alfresco.DocumentDetails} The new DocumentDetails instance
    * @constructor
    */
   Alfresco.DocumentDetails = function DocumentDetails_constructor()
   {
      Alfresco.DocumentDetails.superclass.constructor.call(this, null, "Alfresco.DocumentDetails", ["editor"]);

      /* Decoupled event listeners */
      YAHOO.Bubbling.on("metadataRefresh", this.onReady, this);
      YAHOO.Bubbling.on("filesPermissionsUpdated", this.onReady, this);
      YAHOO.Bubbling.on("filesMoved", this.onReady, this);
      YAHOO.Bubbling.on("documentDetailsAvailable", this.onDocumentDetailsAvailable, this);
            
      return this;
   };
   
   YAHOO.extend(Alfresco.DocumentDetails, Alfresco.component.Base,
   {
      /**
       * Object container for initialization options
       *
       * @property options
       * @type object
       */
      options:
      {
         /**
          * nodeRef of document being viewed
          * 
          * @property nodeRef
          * @type Alfresco.util.NodeRef
          */
         nodeRef: null,
         
         /**
          * Current siteId.
          * 
          * @property siteId
          * @type string
          */
         siteId: "",

         /**
          * Root node if Repository-based library
          * 
          * @property rootNode
          * @type Alfresco.util.NodeRef
          */
         rootNode: null
      },

      /**
       * Fired by YUILoaderHelper when required component script files have been loaded into the browser.
       * NOTE: This component doesn't have an htmlId, so we can't use onContentReady.
       *
       * @override
       * @method onComponentsLoaded
       */
      onComponentsLoaded: function DocumentDetails_onComponentsLoaded()
      {
         YAHOO.util.Event.onDOMReady(this.onReady, this, true);
      },

      /**
       * Fired by YUI when parent element is available for scripting.
       * Template initialisation, including instantiation of YUI widgets and event listener binding.
       *
       * @method onReady
       */
      onReady: function DocumentDetails_onReady()
      {
         var url = Alfresco.constants.PROXY_URI + 'slingshot/doclib/node/' + this.options.nodeRef.uri;
         if (this.options.siteId == "")
         {
            // Repository mode
            url += "?libraryRoot=" + encodeURIComponent(this.options.rootNode.toString());
         }

         Alfresco.util.Ajax.jsonGet(
         {
            method: "GET",
            url: url,
            successCallback: 
            { 
               fn: this._getDataSuccess, 
               scope: this 
            },
            failureCallback: 
            { 
               fn: this._getDataFailure, 
               scope: this 
            }
         });
         
         // Setup scroll handler for to make marked for delete/perish labels sticky if required
         if(!browserIsIE6) {
             var stickyScrollThreshold = 260;
             var stickyBar = YAHOO.util.Dom.get("docDetailsStickyBar");
             var labelWrapper = YAHOO.util.Selector.query(".deleteMarkWrapper")[0];
             YAHOO.util.Event.addListener(window, "scroll", function() {
            	 
            	 var offset;
            	 if(window.pageYOffset != undefined) {
            		 offset = window.pageYOffset;
            	 }
            	 else {
            		 offset = document.documentElement.scrollTop;
            	 }
            	 
            	 if(offset >= stickyScrollThreshold) {
            		 if(!YAHOO.util.Dom.hasClass(stickyBar, "sticky")) {
            			 YAHOO.util.Dom.addClass(stickyBar, "sticky");
            		 }
            		 if(!YAHOO.util.Dom.hasClass(labelWrapper, "sticky")) {
            			 YAHOO.util.Dom.addClass(labelWrapper, "sticky");
            		 }
            	 }
            	 else if(offset < stickyScrollThreshold) {
            		 if(YAHOO.util.Dom.hasClass(stickyBar, "sticky")) {
            			 YAHOO.util.Dom.removeClass(stickyBar, "sticky");
            		 }
            		 if(YAHOO.util.Dom.hasClass(labelWrapper, "sticky")) {
            			 YAHOO.util.Dom.removeClass(labelWrapper, "sticky");
            		 } 
            	 } 

             }); 
         }
         
      },
      
      /**
       * Updates 'Created by' and 'Modified by' fields in the 'Metadata' form with presence information for
       * the relevant users.
       * 
       * Also init marked for deletion/perish label tooltips
       */
      onDocumentDetailsAvailable : function DocumentDetails_onDocumentDetailsAvailable(layer, args)
      {
    	  var assetData = args[1].documentDetails;
    	  
    	  jQuery(".viewmode-label:contains('Creator')").siblings('.viewmode-value').presenceIndicator(
    			  assetData.createdByUser, assetData.createdBy,  assetData.createdByUserPresence);
          
    	  jQuery(".viewmode-label:contains('Modifier')").siblings('.viewmode-value').presenceIndicator(
        		  assetData.modifiedByUser, assetData.modifiedBy, assetData.modifiedByUserPresence);
    	  
      },
      
      /**
       * Success handler called when the AJAX call to the doclist web script returns successfully
       *
       * @method _getDataSuccess
       * @param response {object} The response object
       * @private
       */
      _getDataSuccess: function DocumentDetails__getDataSuccess(response)
      {
         if (response.json !== undefined)
         {
            var documentMetadata = response.json.metadata,
               documentDetails = response.json.item,
               commentNode = documentDetails.nodeRef,
               workingCopyMode = false;
            
            /**
             * If we're viewing a working copy, then:
             *  (a) set "working copy" flag to allow some components to stay hidden/hide themselves
             *  (b) show (read-only) comments from the source instead
             */
            if (documentDetails.custom && documentDetails.custom.isWorkingCopy)
            {
               workingCopyMode = true;
               // Show orignal's comments (read-only)
               // commentNode = documentDetails.custom.workingCopyOriginal;
            }

            // Fire event with parent metadata
            YAHOO.Bubbling.fire("doclistMetadata",
            {
               metadata: documentMetadata
            });

            // Fire event to inform any listening components that the data is ready
            YAHOO.Bubbling.fire("documentDetailsAvailable",
            {
               documentDetails: documentDetails,
               metadata: response.json.metadata,
               workingCopyMode: workingCopyMode
            });
            
            // Fire event to show comments for document
            YAHOO.Bubbling.fire("setCommentedNode",
            { 
               nodeRef: commentNode,
               title: documentDetails.displayName,
               page: "document-details",
               pageParams:
               {
                  nodeRef: this.options.nodeRef.toString()
               }
            });
         }
      },

      /**
       * Failure handler called when the AJAX call to the doclist web script fails
       *
       * @method _getDataFailure
       * @param response {object} The response object
       * @private
       */
      _getDataFailure: function DocumentDetails__getDataFailure(response)
      {
         YAHOO.Bubbling.fire("documentDetailsFailure");
         Alfresco.util.PopupManager.displayPrompt(
         {
            text: this.msg("message.item-missing"),
            modal: true
         });
      }
   });
})();
