using System.Threading.Tasks;
using Abp.Application.Services;
using LABAPP.Sessions.Dto;

namespace LABAPP.Sessions
{
    public interface ISessionAppService : IApplicationService
    {
        Task<GetCurrentLoginInformationsOutput> GetCurrentLoginInformations();
    }
}
