using System.Threading.Tasks;
using LABAPP.Configuration.Dto;

namespace LABAPP.Configuration
{
    public interface IConfigurationAppService
    {
        Task ChangeUiTheme(ChangeUiThemeInput input);
    }
}
