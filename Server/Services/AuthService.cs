using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ConstructionMarketplace.DTOs;
using ConstructionMarketplace.Models;
using ConstructionMarketplace.Repositories;

namespace ConstructionMarketplace.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration,
            IWebHostEnvironment env,
            IUserRepository userRepository,
            ILogger<AuthService> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _env = env;
            _userRepository = userRepository;
            _logger = logger;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(loginDto.Email);
                if (user == null || !user.IsActive)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid email or password."
                    };
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
                if (!result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid email or password."
                    };
                }

                var roles = await _userManager.GetRolesAsync(user);
                // If merchant not yet verified, block login
                if (roles.Contains("Merchant") && !user.IsVerified)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Your account is pending admin approval. Please wait for approval.",
                        User = MapToUserDto(user, roles.ToList())
                    };
                }

                var token = GenerateJwtToken(user, roles);
                var tokenExpiration = DateTime.UtcNow.AddDays(_configuration.GetValue<int>("Jwt:ExpireDays"));

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Login successful.",
                    Token = token,
                    TokenExpiration = tokenExpiration,
                    User = MapToUserDto(user, roles.ToList())
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email: {Email}", loginDto.Email);
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred during login."
                };
            }
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            try
            {
                if (await _userManager.FindByEmailAsync(registerDto.Email) != null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Email is already registered."
                    };
                }

                var user = new ApplicationUser
                {
                    UserName = registerDto.Email,
                    Email = registerDto.Email,
                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
                    MiddleName = registerDto.MiddleName,
                    PhoneNumber = registerDto.PhoneNumber,
                    PhoneSecondary = registerDto.PhoneSecondary,
                    Address = registerDto.Address,
                    City = !string.IsNullOrWhiteSpace(registerDto.CityName) ? registerDto.CityName : registerDto.City,
                    Country = registerDto.Country,
                    PostalCode = registerDto.PostalCode,
                    BuildingNumber = registerDto.BuildingNumber,
                    StreetName = registerDto.StreetName,
                    CompanyName = registerDto.CompanyName,
                    TaxNumber = registerDto.TaxNumber,
                    Iban = registerDto.Iban,
                    LicenseNumber = null, // optional: map if you add to DTO as text
                    DateOfBirth = registerDto.DateOfBirth ?? DateTime.MinValue,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    // Optional: keep registry meta in user profile for merchant
                    RegistryStart = registerDto.RegistryStart,
                    RegistryEnd = registerDto.RegistryEnd,
                };

                var result = await _userManager.CreateAsync(user, registerDto.Password);
                if (!result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    };
                }

                // Save Cloudinary URLs if provided, otherwise save uploaded files
                try
                {
                    bool changed = false;

                    // Prefer URLs from Cloudinary if present
                    if (!string.IsNullOrWhiteSpace(registerDto.ProfilePictureUrl))
                    {
                        user.ProfilePicture = registerDto.ProfilePictureUrl;
                        changed = true;
                    }

                    if (!string.IsNullOrWhiteSpace(registerDto.VendorDocumentUrl))
                    {
                        user.VendorDocumentPath = registerDto.VendorDocumentUrl;
                        changed = true;
                    }

                    if (!string.IsNullOrWhiteSpace(registerDto.VendorLicenseImageUrl))
                    {
                        user.VendorLicenseImagePath = registerDto.VendorLicenseImageUrl;
                        changed = true;
                    }

                    // If URLs were not provided, fallback to storing files on disk (legacy)
                    if (!changed)
                    {
                        var webRoot = _env.WebRootPath;
                        if (string.IsNullOrWhiteSpace(webRoot))
                        {
                            webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                        }
                        var vendorDir = Path.Combine(webRoot, "uploads", "vendors", user.Id);
                        Directory.CreateDirectory(vendorDir);

                        if (registerDto.ImageFile != null && registerDto.ImageFile.Length > 0)
                        {
                            var imgName = $"img_{DateTime.UtcNow:yyyyMMddHHmmssfff}_{Path.GetFileName(registerDto.ImageFile.FileName)}";
                            var imgPath = Path.Combine(vendorDir, imgName);
                            using (var fs = new FileStream(imgPath, FileMode.Create))
                            {
                                await registerDto.ImageFile.CopyToAsync(fs);
                            }
                            var rel = $"/uploads/vendors/{user.Id}/{imgName}".Replace("\\", "/");
                            user.ProfilePicture = rel;
                            changed = true;
                        }

                        if (registerDto.DocumentFile != null && registerDto.DocumentFile.Length > 0)
                        {
                            var docName = $"doc_{DateTime.UtcNow:yyyyMMddHHmmssfff}_{Path.GetFileName(registerDto.DocumentFile.FileName)}";
                            var docPath = Path.Combine(vendorDir, docName);
                            using (var fs = new FileStream(docPath, FileMode.Create))
                            {
                                await registerDto.DocumentFile.CopyToAsync(fs);
                            }
                            var rel = $"/uploads/vendors/{user.Id}/{docName}".Replace("\\", "/");
                            user.VendorDocumentPath = rel;
                            changed = true;
                        }

                        if (registerDto.LicenseImage != null && registerDto.LicenseImage.Length > 0)
                        {
                            var licName = $"lic_{DateTime.UtcNow:yyyyMMddHHmmssfff}_{Path.GetFileName(registerDto.LicenseImage.FileName)}";
                            var licPath = Path.Combine(vendorDir, licName);
                            using (var fs = new FileStream(licPath, FileMode.Create))
                            {
                                await registerDto.LicenseImage.CopyToAsync(fs);
                            }
                            var rel = $"/uploads/vendors/{user.Id}/{licName}".Replace("\\", "/");
                            user.VendorLicenseImagePath = rel;
                            changed = true;
                        }
                    }

                    if (changed)
                    {
                        await _userManager.UpdateAsync(user);
                    }
                }
                catch (Exception fileEx)
                {
                    _logger.LogError(fileEx, "Error saving vendor files/urls for user {UserId}", user.Id);
                }

                // Assign role
                if (!string.IsNullOrEmpty(registerDto.Role) && 
                    (registerDto.Role == "Customer" || registerDto.Role == "Merchant" || registerDto.Role == "Worker"))
                {
                    await _userManager.AddToRoleAsync(user, registerDto.Role);
                }
                else
                {
                    await _userManager.AddToRoleAsync(user, "Customer"); // Default role
                }

                var roles = await _userManager.GetRolesAsync(user);

                // If merchant, mark as pending approval and do not return token
                if (roles.Contains("Merchant"))
                {
                    user.IsVerified = false;
                    await _userManager.UpdateAsync(user);
                    return new AuthResponseDto
                    {
                        Success = true,
                        Message = "Registration successful. Your account is pending admin approval.",
                        User = MapToUserDto(user, roles.ToList())
                    };
                }

                var token = GenerateJwtToken(user, roles);
                var tokenExpiration = DateTime.UtcNow.AddDays(_configuration.GetValue<int>("Jwt:ExpireDays"));

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Registration successful.",
                    Token = token,
                    TokenExpiration = tokenExpiration,
                    User = MapToUserDto(user, roles.ToList())
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for email: {Email}", registerDto.Email);
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred during registration."
                };
            }
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string token)
        {
            try
            {
                var tokenValidation = await ValidateTokenAsync(token);
                if (!tokenValidation.IsValid || string.IsNullOrEmpty(tokenValidation.UserId))
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid token."
                    };
                }

                var user = await _userManager.FindByIdAsync(tokenValidation.UserId);
                if (user == null || !user.IsActive)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "User not found or inactive."
                    };
                }

                var roles = await _userManager.GetRolesAsync(user);
                var newToken = GenerateJwtToken(user, roles);
                var tokenExpiration = DateTime.UtcNow.AddDays(_configuration.GetValue<int>("Jwt:ExpireDays"));

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Token refreshed successfully.",
                    Token = newToken,
                    TokenExpiration = tokenExpiration,
                    User = MapToUserDto(user, roles.ToList())
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred during token refresh."
                };
            }
        }

        public async Task<bool> LogoutAsync(string userId)
        {
            try
            {
                await _signInManager.SignOutAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout for user: {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return false;

                var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
                return result.Succeeded;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user: {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(forgotPasswordDto.Email);
                if (user == null)
                    return true; // Don't reveal if email exists

                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                // TODO: Send email with reset token
                // await _emailService.SendPasswordResetEmailAsync(user.Email, token);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during forgot password for email: {Email}", forgotPasswordDto.Email);
                return false;
            }
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);
                if (user == null)
                    return false;

                var result = await _userManager.ResetPasswordAsync(user, resetPasswordDto.Token, resetPasswordDto.NewPassword);
                return result.Succeeded;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during password reset for email: {Email}", resetPasswordDto.Email);
                return false;
            }
        }

        public async Task<UserDto?> GetUserProfileAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return null;

                var roles = await _userManager.GetRolesAsync(user);
                return MapToUserDto(user, roles.ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user profile for user: {UserId}", userId);
                return null;
            }
        }

        public async Task<bool> UpdateUserProfileAsync(string userId, UpdateProfileDto updateProfileDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return false;

                user.FirstName = updateProfileDto.FirstName;
                user.MiddleName = updateProfileDto.MiddleName;
                user.LastName = updateProfileDto.LastName;
                user.PhoneNumber = updateProfileDto.PhoneNumber;
                user.Address = updateProfileDto.Address;
                user.City = updateProfileDto.City;
                user.Country = updateProfileDto.Country;
                user.PostalCode = updateProfileDto.PostalCode;
                user.CompanyName = updateProfileDto.CompanyName;
                user.Bio = updateProfileDto.Bio;
                user.DateOfBirth = updateProfileDto.DateOfBirth ?? user.DateOfBirth;
                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(user);
                return result.Succeeded;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile for user: {UserId}", userId);
                return false;
            }
        }

        public Task<TokenValidationDto> ValidateTokenAsync(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var roles = principal.FindAll(ClaimTypes.Role).Select(x => x.Value).ToList();

                var result = new TokenValidationDto
                {
                    IsValid = true,
                    UserId = userId,
                    Roles = roles,
                    Message = "Token is valid."
                };

                return Task.FromResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating token");
                var result = new TokenValidationDto
                {
                    IsValid = false,
                    Message = "Invalid token."
                };
                return Task.FromResult(result);
            }
        }

        public async Task<bool> ConfirmEmailAsync(string userId, string token)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return false;

                var result = await _userManager.ConfirmEmailAsync(user, token);
                return result.Succeeded;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error confirming email for user: {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> ResendEmailConfirmationAsync(string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null || user.EmailConfirmed)
                    return true; // Don't reveal if email exists

                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                // TODO: Send confirmation email
                // await _emailService.SendEmailConfirmationAsync(user.Email, token);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resending email confirmation for email: {Email}", email);
                return false;
            }
        }

        public string GenerateJwtToken(ApplicationUser user, IList<string> roles)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim("firstName", user.FirstName),
                new Claim("lastName", user.LastName)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(_configuration.GetValue<int>("Jwt:ExpireDays")),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<bool> IsEmailAvailableAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            return user == null;
        }

        public async Task<bool> IsUsernameAvailableAsync(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            return user == null;
        }

        private UserDto MapToUserDto(ApplicationUser user, List<string> roles)
        {
            var role = roles?.FirstOrDefault() ?? string.Empty;
            var name = ($"{user.FirstName}"
                        + (string.IsNullOrWhiteSpace(user.MiddleName) ? string.Empty : $" {user.MiddleName}")
                        + (string.IsNullOrWhiteSpace(user.LastName) ? string.Empty : $" {user.LastName}")).Trim();
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email!,
                Name = name,
                Role = role,
                FirstName = user.FirstName,
                LastName = user.LastName,
                MiddleName = user.MiddleName,
                PhoneNumber = user.PhoneNumber,
                PhoneSecondary = user.PhoneSecondary,
                Address = user.Address,
                City = user.City,
                Country = user.Country,
                PostalCode = user.PostalCode,
                BuildingNumber = user.BuildingNumber,
                StreetName = user.StreetName,
                CompanyName = user.CompanyName,
                Iban = user.Iban,
                RegistryStart = user.RegistryStart,
                RegistryEnd = user.RegistryEnd,
                IsVerified = user.IsVerified,
                IsActive = user.IsActive,
                Rating = user.Rating,
                ReviewCount = user.ReviewCount,
                HasAccountingSubscription = user.HasAccountingSubscription,
                SubscriptionEndDate = user.SubscriptionEndDate,
                Roles = roles ?? new List<string>(),
                CreatedAt = user.CreatedAt,
                ProfilePicture = user.ProfilePicture,
                VendorDocumentPath = user.VendorDocumentPath,
                VendorLicenseImagePath = user.VendorLicenseImagePath,
            };
        }
    }
}
