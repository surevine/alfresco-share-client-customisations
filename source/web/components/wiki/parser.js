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
 * Wiki markup parser. 
 * Very simple parser that converts a subset of wiki markup to HTML.
 * 
 * @namespace Alfresco
 * @class Alfresco.WikiParser
 */
(function()
{
   /**
    * WikiParser constructor.
    * 
    * @return {Alfresco.WikiParser} The new parser instance
    * @constructor
    */
   Alfresco.WikiParser = function()
   {
      return this;
   };

   Alfresco.WikiParser.prototype =
   {
      /**
       * The url to use when rewriting links.
       * 
       * @property URL
       * @type String
       */
      URL: null,
      
      /**
       * Renders wiki markup.
       *
       * @method parse
       * @param test {String} The text to render
       */
      parse: function WikiParser_parse(text, pages)
      {
         pages = pages == null ? [] : pages;
         text = this._renderLinks(text, pages);
         return text;
      },
      
      /**
       * Looks for instance of [[ ]] in the text and replaces
       * them as appropriate.
       * 
       * @method _renderLinks
       * @private
       * @param s {String} The text to render
       * @param pages {Array} The existing pages on the current site
       */
      _renderLinks: function WikiParser__renderLinks(s, pages)
      {
         if (typeof s == "string")
         {
            var result = s.split("[["), text = s;
         
            if (result.length > 1)
            {
               var re = /^([^\|\]]+)(?:\|([^\]]+))?\]\]/;
               var uri, i, ii, str, matches, page, exists;
               text = result[0];
            
               for (i = 1, ii = result.length; i < ii; i++)
               {
                  str = result[i];
                  if (re.test(str))
                  {
                     matches = re.exec(str);
                     // Replace " " character in page URL with "_"
                     page = matches[1].replace(/\s+/g, "_");
                     exists = Alfresco.util.arrayContains(pages, page);
                     uri = '<a href="' + this.URL + encodeURIComponent(Alfresco.util.decodeHTML(page)) + '" class="' + (exists ? 'theme-color-1' : 'wiki-missing-page') + '">';
                     uri += (matches[2] ? matches[2] : matches[1]);
                     uri += '</a>';
                     
                     text += uri;
                     text += str.substring(matches[0].length);
                  } else {
                	  text += "[[" +str;
                  }
               }
            }   
            return text;
         }
         return s;
      }
   };
})();
