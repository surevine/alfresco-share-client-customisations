<script type="text/javascript">//<![CDATA[
   Alfresco.util.ComponentManager.get("${args.htmlid}").setOptions(
   {
      roles:
      {
         <#list siteRoles as siteRole>"${siteRole}": true<#if siteRole_has_next>,</#if></#list>
      },
      
      groups:
      {
         <#list groupNames as group>"${group}": "${permissionGroups[group_index]}"<#if group_has_next>,</#if></#list>
      }
   }).setMessages(
      ${messages}
   );
//]]></script>
<div id="${args.htmlid}-dialog" class="permissions">
   <div id="${args.htmlid}-title" class="hd"></div>
   <div class="bd">
      <p/>
      <div class="yui-g">
         <h2>${msg("header.manage")}</h2>
      </div>
      <div class="groups">
         <div class="yui-gd">
            <div class="yui-u first right"><label>${msg("label.usershave")}</label></div>
            <div class="yui-u flat-button">
               <button id="${args.htmlid}-permission" value="all" class="site-group"></button>
               <select id="${args.htmlid}-permission-select">
   <#list siteRoles as siteRole>
                  <option value="${siteRole}">${msg("role." + siteRole)}</option>
   </#list>
               </select>
            </div>
         </div>
      </div>
      <div class="actions">
         <div class="yui-gd">
            <div class="yui-u first reset-btn">
               <button id="${args.htmlid}-reset-all">${msg("label.reset-all")}</button>
            </div>
            <div class="yui-u">
               <label>${msg("label.mangerdefaults")}</label>
            </div>
         </div>
      </div>
      <p/>
      <div class="bdft">
         <input type="button" id="${args.htmlid}-ok" value="${msg("button.save")}" tabindex="0" />
         <input type="button" id="${args.htmlid}-cancel" value="${msg("button.cancel")}" tabindex="0" />
      </div>
   </div>
</div>