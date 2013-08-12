<#include "include/alfresco-template.ftl" />
<#import "import/alfresco-layout.ftl" as layout />
<@templateHeader "transitional" />

<@templateBody>
<#assign class><#if page.url.templateArgs.site??>site-dashboard<#else>user-dashboard</#if></#assign>
<div class="dashboard ${class}">
   <div id="alf-hd">
      <@region id="header" scope="global" protected=true />
      <@region id="title" scope="page" protected=true />
      <@region id="navigation" scope="page" protected=true />
   </div>
   <div id="bd">
      <@layout.grid gridColumns gridClass "component" />
   </div>
</div>
</@>

<@templateFooter>
   <div id="alf-ft">
      <@region id="footer" scope="global" protected=true />
   </div>
</@>