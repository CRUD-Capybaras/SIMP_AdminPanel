using Abp.AspNetCore.Mvc.Controllers;
using Abp.IdentityFramework;
using Microsoft.AspNetCore.Identity;

namespace LABAPP.Controllers
{
    public abstract class LABAPPControllerBase: AbpController
    {
        protected LABAPPControllerBase()
        {
            LocalizationSourceName = LABAPPConsts.LocalizationSourceName;
        }

        protected void CheckErrors(IdentityResult identityResult)
        {
            identityResult.CheckErrors(LocalizationManager);
        }
    }
}
