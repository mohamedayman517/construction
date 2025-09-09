using ConstructionMarketplace.DTOs;
using ConstructionMarketplace.Models;

namespace ConstructionMarketplace.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<AuthResponseDto> RefreshTokenAsync(string token);
        Task<bool> LogoutAsync(string userId);
        Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);
        Task<bool> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
        Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
        Task<UserDto?> GetUserProfileAsync(string userId);
        Task<bool> UpdateUserProfileAsync(string userId, UpdateProfileDto updateProfileDto);
        Task<bool> UpdateIbanAsync(string userId, string iban);
        Task<TokenValidationDto> ValidateTokenAsync(string token);
        Task<bool> ConfirmEmailAsync(string userId, string token);
        Task<bool> ResendEmailConfirmationAsync(string email);
        string GenerateJwtToken(ApplicationUser user, IList<string> roles);
        Task<bool> IsEmailAvailableAsync(string email);
        Task<bool> IsUsernameAvailableAsync(string username);
    }
}

