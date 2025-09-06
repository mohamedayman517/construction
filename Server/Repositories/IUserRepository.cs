using ConstructionMarketplace.Models;

namespace ConstructionMarketplace.Repositories
{
    public interface IUserRepository : IRepository<ApplicationUser>
    {
        Task<ApplicationUser?> GetByEmailAsync(string email);
        Task<ApplicationUser?> GetByUsernameAsync(string username);
        Task<IEnumerable<ApplicationUser>> GetByRoleAsync(string role);
        Task<IEnumerable<ApplicationUser>> GetMerchantsAsync();
        Task<IEnumerable<ApplicationUser>> GetWorkersAsync();
        Task<IEnumerable<ApplicationUser>> GetCustomersAsync();
        Task<IEnumerable<ApplicationUser>> GetVerifiedUsersAsync();
        Task<IEnumerable<ApplicationUser>> GetUsersWithAccountingSubscriptionAsync();
        Task<bool> UpdateRatingAsync(string userId, decimal newRating, int reviewCount);
    }
}

