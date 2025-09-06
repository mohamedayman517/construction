using Microsoft.AspNetCore.Identity;
using ConstructionMarketplace.Models;

namespace ConstructionMarketplace.Data
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            // Ensure database is created
            await context.Database.EnsureCreatedAsync();

            // Seed Roles
            await SeedRolesAsync(roleManager);

            // Seed Default Admin User
            await SeedDefaultUsersAsync(userManager);

            // Seed Categories
            await SeedCategoriesAsync(context);

            await context.SaveChangesAsync();
        }

        private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            string[] roles = { "Admin", "Customer", "Merchant", "Worker" };

            foreach (string role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }

        private static async Task SeedDefaultUsersAsync(UserManager<ApplicationUser> userManager)
        {
            // Create default admin user
            if (await userManager.FindByEmailAsync("admin@constructionmarketplace.com") == null)
            {
                var adminUser = new ApplicationUser
                {
                    UserName = "admin@constructionmarketplace.com",
                    Email = "admin@constructionmarketplace.com",
                    FirstName = "System",
                    LastName = "Administrator",
                    EmailConfirmed = true,
                    IsActive = true,
                    IsVerified = true,
                    VerificationDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await userManager.CreateAsync(adminUser, "Admin@123456");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }

            // Create sample merchant user
            if (await userManager.FindByEmailAsync("merchant@test.com") == null)
            {
                var merchantUser = new ApplicationUser
                {
                    UserName = "merchant@test.com",
                    Email = "merchant@test.com",
                    FirstName = "John",
                    LastName = "Builder",
                    CompanyName = "Builder's Supply Co.",
                    EmailConfirmed = true,
                    IsActive = true,
                    IsVerified = true,
                    VerificationDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    HasAccountingSubscription = true,
                    SubscriptionStartDate = DateTime.UtcNow,
                    SubscriptionEndDate = DateTime.UtcNow.AddYears(1)
                };

                var result = await userManager.CreateAsync(merchantUser, "Merchant@123456");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(merchantUser, "Merchant");
                }
            }

            // Create sample customer user
            if (await userManager.FindByEmailAsync("customer@test.com") == null)
            {
                var customerUser = new ApplicationUser
                {
                    UserName = "customer@test.com",
                    Email = "customer@test.com",
                    FirstName = "Jane",
                    LastName = "Smith",
                    EmailConfirmed = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await userManager.CreateAsync(customerUser, "Customer@123456");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(customerUser, "Customer");
                }
            }

            // Create sample worker user
            if (await userManager.FindByEmailAsync("worker@test.com") == null)
            {
                var workerUser = new ApplicationUser
                {
                    UserName = "worker@test.com",
                    Email = "worker@test.com",
                    FirstName = "Mike",
                    LastName = "Carpenter",
                    EmailConfirmed = true,
                    IsActive = true,
                    IsVerified = true,
                    VerificationDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await userManager.CreateAsync(workerUser, "Worker@123456");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(workerUser, "Worker");
                }
            }
        }

        private static async Task SeedCategoriesAsync(ApplicationDbContext context)
        {
            if (!context.Categories.Any())
            {
                var categories = new List<Category>
                {
                    new Category
                    {
                        NameEn = "Building Materials",
                        NameAr = "مواد البناء",
                        DescriptionEn = "All types of building and construction materials",
                        DescriptionAr = "جميع أنواع مواد البناء والتشييد",
                        IsActive = true,
                        SortOrder = 1
                    },
                    new Category
                    {
                        NameEn = "Tools & Equipment",
                        NameAr = "الأدوات والمعدات",
                        DescriptionEn = "Construction tools and heavy equipment",
                        DescriptionAr = "أدوات البناء والمعدات الثقيلة",
                        IsActive = true,
                        SortOrder = 2
                    },
                    new Category
                    {
                        NameEn = "Doors & Windows",
                        NameAr = "الأبواب والنوافذ",
                        DescriptionEn = "Custom and standard doors and windows",
                        DescriptionAr = "أبواب ونوافذ مخصصة وقياسية",
                        IsActive = true,
                        SortOrder = 3
                    },
                    new Category
                    {
                        NameEn = "Electrical Supplies",
                        NameAr = "المستلزمات الكهربائية",
                        DescriptionEn = "Electrical components and supplies",
                        DescriptionAr = "المكونات والمستلزمات الكهربائية",
                        IsActive = true,
                        SortOrder = 4
                    },
                    new Category
                    {
                        NameEn = "Plumbing Supplies",
                        NameAr = "مستلزمات السباكة",
                        DescriptionEn = "Pipes, fittings, and plumbing fixtures",
                        DescriptionAr = "الأنابيب والتركيبات وتجهيزات السباكة",
                        IsActive = true,
                        SortOrder = 5
                    },
                    new Category
                    {
                        NameEn = "Safety Equipment",
                        NameAr = "معدات السلامة",
                        DescriptionEn = "Personal protective equipment and safety gear",
                        DescriptionAr = "معدات الحماية الشخصية ومعدات السلامة",
                        IsActive = true,
                        SortOrder = 6
                    }
                };

                context.Categories.AddRange(categories);
                await context.SaveChangesAsync();

                // Add subcategories
                var buildingMaterialsId = context.Categories.First(c => c.NameEn == "Building Materials").Id;
                var toolsEquipmentId = context.Categories.First(c => c.NameEn == "Tools & Equipment").Id;

                var subCategories = new List<Category>
                {
                    new Category
                    {
                        NameEn = "Cement & Concrete",
                        NameAr = "الأسمنت والخرسانة",
                        ParentCategoryId = buildingMaterialsId,
                        IsActive = true,
                        SortOrder = 1
                    },
                    new Category
                    {
                        NameEn = "Steel & Rebar",
                        NameAr = "الفولاذ وحديد التسليح",
                        ParentCategoryId = buildingMaterialsId,
                        IsActive = true,
                        SortOrder = 2
                    },
                    new Category
                    {
                        NameEn = "Power Tools",
                        NameAr = "الأدوات الكهربائية",
                        ParentCategoryId = toolsEquipmentId,
                        IsActive = true,
                        SortOrder = 1
                    },
                    new Category
                    {
                        NameEn = "Heavy Machinery",
                        NameAr = "الآلات الثقيلة",
                        ParentCategoryId = toolsEquipmentId,
                        IsActive = true,
                        SortOrder = 2
                    }
                };

                context.Categories.AddRange(subCategories);
            }
        }
    }
}

