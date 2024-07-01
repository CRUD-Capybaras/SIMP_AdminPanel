using Abp.Authorization;
using LABAPP.Authorization.Roles;
using LABAPP.Authorization.Users;

namespace LABAPP.Authorization
{
    public class PermissionChecker : PermissionChecker<Role, User>
    {
        public PermissionChecker(UserManager userManager)
            : base(userManager)
        {
        }
    }
}
