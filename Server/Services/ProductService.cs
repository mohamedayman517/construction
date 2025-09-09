using ConstructionMarketplace.DTOs;
using ConstructionMarketplace.Models;
using ConstructionMarketplace.Repositories;

namespace ConstructionMarketplace.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<ProductService> _logger;

        public ProductService(
            IProductRepository productRepository,
            ICategoryRepository categoryRepository,
            IUserRepository userRepository,
            ILogger<ProductService> logger)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
            _userRepository = userRepository;
            _logger = logger;
        }

        public async Task<PagedResultDto<ProductDto>> GetProductsAsync(SearchFilterDto filter)
        {
            try
            {
                var (products, totalCount) = await _productRepository.GetPagedAsync(
                    filter.Page,
                    filter.PageSize,
                    p => (string.IsNullOrEmpty(filter.SearchTerm) || 
                          p.NameEn.Contains(filter.SearchTerm) || 
                          p.NameAr.Contains(filter.SearchTerm)) &&
                         (!filter.CategoryId.HasValue || p.CategoryId == filter.CategoryId.Value) &&
                         (!filter.MinPrice.HasValue || p.Price >= filter.MinPrice.Value) &&
                         (!filter.MaxPrice.HasValue || p.Price <= filter.MaxPrice.Value) &&
                         (!filter.IsAvailableForRent.HasValue || p.IsAvailableForRent == filter.IsAvailableForRent.Value) &&
                         p.IsActive && p.IsApproved,
                    p => p.CreatedAt,
                    !filter.SortDescending
                );

                var productDtos = products.Select(MapToProductDto).ToList();

                return new PagedResultDto<ProductDto>
                {
                    Items = productDtos,
                    TotalCount = totalCount,
                    Page = filter.Page,
                    PageSize = filter.PageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize),
                    HasNextPage = filter.Page < (int)Math.Ceiling((double)totalCount / filter.PageSize),
                    HasPreviousPage = filter.Page > 1
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting products with filter");
                throw;
            }
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            try
            {
                var product = await _productRepository.GetByIdAsync(id);
                return product != null ? MapToProductDto(product) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product by id: {ProductId}", id);
                throw;
            }
        }

        public async Task<ProductDto?> GetProductBySlugAsync(string slug)
        {
            try
            {
                var product = await _productRepository.GetBySlugAsync(slug);
                return product != null ? MapToProductDto(product) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product by slug: {Slug}", slug);
                throw;
            }
        }

        public async Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(int categoryId)
        {
            try
            {
                var products = await _productRepository.GetByCategoryAsync(categoryId);
                return products.Select(MapToProductDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting products by category: {CategoryId}", categoryId);
                throw;
            }
        }

        public async Task<IEnumerable<ProductDto>> GetProductsByMerchantAsync(string merchantId)
        {
            try
            {
                var products = await _productRepository.GetByMerchantAsync(merchantId);
                return products.Select(MapToProductDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting products by merchant: {MerchantId}", merchantId);
                throw;
            }
        }

        public async Task<IEnumerable<ProductDto>> GetFeaturedProductsAsync()
        {
            try
            {
                var products = await _productRepository.GetFeaturedProductsAsync();
                return products.Select(MapToProductDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured products");
                throw;
            }
        }

        public async Task<IEnumerable<ProductDto>> GetAvailableForRentAsync()
        {
            try
            {
                var products = await _productRepository.GetAvailableForRentAsync();
                return products.Select(MapToProductDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting products available for rent");
                throw;
            }
        }

        public async Task<ProductDto> CreateProductAsync(string merchantId, CreateProductDto createProductDto)
        {
            try
            {
                var product = new Product
                {
                    NameEn = createProductDto.NameEn,
                    NameAr = createProductDto.NameAr,
                    DescriptionEn = createProductDto.DescriptionEn,
                    DescriptionAr = createProductDto.DescriptionAr,
                    MerchantId = merchantId,
                    CategoryId = createProductDto.CategoryId,
                    Price = createProductDto.Price,
                    DiscountPrice = createProductDto.DiscountPrice,
                    StockQuantity = createProductDto.StockQuantity,
                    AllowCustomDimensions = createProductDto.AllowCustomDimensions,
                    IsAvailableForRent = createProductDto.IsAvailableForRent,
                    RentPricePerDay = createProductDto.RentPricePerDay,
                    Slug = GenerateSlug(createProductDto.NameEn),
                    CreatedAt = DateTime.UtcNow,
                    IsApproved = false
                };

                // Add attributes
                foreach (var attr in createProductDto.Attributes)
                {
                    product.Attributes.Add(new ProductAttribute
                    {
                        NameEn = attr.NameEn,
                        NameAr = attr.NameAr,
                        ValueEn = attr.ValueEn,
                        ValueAr = attr.ValueAr
                    });
                }

                var createdProduct = await _productRepository.AddAsync(product);
                await _productRepository.SaveChangesAsync();

                return MapToProductDto(createdProduct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product for merchant: {MerchantId}", merchantId);
                throw;
            }
        }

        public async Task<ProductDto?> UpdateProductAsync(int id, string merchantId, CreateProductDto updateProductDto)
        {
            try
            {
                var product = await _productRepository.GetByIdAsync(id);
                if (product == null || product.MerchantId != merchantId)
                    return null;

                product.NameEn = updateProductDto.NameEn;
                product.NameAr = updateProductDto.NameAr;
                product.DescriptionEn = updateProductDto.DescriptionEn;
                product.DescriptionAr = updateProductDto.DescriptionAr;
                product.CategoryId = updateProductDto.CategoryId;
                product.Price = updateProductDto.Price;
                product.DiscountPrice = updateProductDto.DiscountPrice;
                product.StockQuantity = updateProductDto.StockQuantity;
                product.AllowCustomDimensions = updateProductDto.AllowCustomDimensions;
                product.IsAvailableForRent = updateProductDto.IsAvailableForRent;
                product.RentPricePerDay = updateProductDto.RentPricePerDay;
                product.UpdatedAt = DateTime.UtcNow;

                await _productRepository.UpdateAsync(product);
                await _productRepository.SaveChangesAsync();

                return MapToProductDto(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product: {ProductId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteProductAsync(int id, string merchantId)
        {
            try
            {
                var product = await _productRepository.GetByIdAsync(id);
                if (product == null || product.MerchantId != merchantId)
                    return false;

                product.IsActive = false;
                product.UpdatedAt = DateTime.UtcNow;

                await _productRepository.UpdateAsync(product);
                return await _productRepository.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product: {ProductId}", id);
                throw;
            }
        }

        public async Task<bool> UpdateStockAsync(int id, int newStock)
        {
            try
            {
                return await _productRepository.UpdateStockAsync(id, newStock);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stock for product: {ProductId}", id);
                throw;
            }
        }

        public async Task<bool> IncrementViewCountAsync(int id)
        {
            try
            {
                return await _productRepository.IncrementViewCountAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error incrementing view count for product: {ProductId}", id);
                throw;
            }
        }

        private ProductDto MapToProductDto(Product product)
        {
            return new ProductDto
            {
                Id = product.Id,
                NameEn = product.NameEn,
                NameAr = product.NameAr,
                DescriptionEn = product.DescriptionEn,
                DescriptionAr = product.DescriptionAr,
                MerchantId = product.MerchantId,
                MerchantName = product.Merchant?.FirstName + " " + product.Merchant?.LastName ?? "",
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.NameEn ?? "",
                Price = product.Price,
                DiscountPrice = product.DiscountPrice,
                Currency = product.Currency,
                StockQuantity = product.StockQuantity,
                AllowCustomDimensions = product.AllowCustomDimensions,
                IsAvailableForRent = product.IsAvailableForRent,
                RentPricePerDay = product.RentPricePerDay,
                IsApproved = product.IsApproved,
                ApprovedAt = product.ApprovedAt,
                AverageRating = product.AverageRating,
                ReviewCount = product.ReviewCount,
                Images = product.Images?.Select(i => new ProductImageDto
                {
                    Id = i.Id,
                    ImageUrl = i.ImageUrl,
                    AltText = i.AltText,
                    IsPrimary = i.IsPrimary
                }).ToList() ?? new List<ProductImageDto>(),
                Attributes = product.Attributes?.Select(a => new ProductAttributeDto
                {
                    Id = a.Id,
                    NameEn = a.NameEn,
                    NameAr = a.NameAr,
                    ValueEn = a.ValueEn,
                    ValueAr = a.ValueAr
                }).ToList() ?? new List<ProductAttributeDto>(),
                CreatedAt = product.CreatedAt
            };
        }

        public async Task<bool> ApproveProductAsync(int id)
        {
            try
            {
                var product = await _productRepository.GetByIdAsync(id);
                if (product == null) return false;
                product.IsApproved = true;
                product.ApprovedAt = DateTime.UtcNow;
                await _productRepository.UpdateAsync(product);
                return await _productRepository.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving product: {ProductId}", id);
                throw;
            }
        }

        public async Task<bool> RejectProductAsync(int id, string reason)
        {
            try
            {
                var product = await _productRepository.GetByIdAsync(id);
                if (product == null) return false;
                product.IsApproved = false;
                product.ApprovedAt = null;
                // Optionally: store reason in future field
                await _productRepository.UpdateAsync(product);
                return await _productRepository.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting product: {ProductId}", id);
                throw;
            }
        }

        private string GenerateSlug(string name)
        {
            return name.ToLower()
                      .Replace(" ", "-")
                      .Replace("&", "and")
                      .Replace("'", "")
                      .Replace("\"", "");
        }
    }

    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly ILogger<CategoryService> _logger;

        public CategoryService(ICategoryRepository categoryRepository, ILogger<CategoryService> logger)
        {
            _categoryRepository = categoryRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<CategoryDto>> GetRootCategoriesAsync()
        {
            try
            {
                var categories = await _categoryRepository.GetRootCategoriesAsync();
                return categories.Select(MapToCategoryDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting root categories");
                throw;
            }
        }

        public async Task<IEnumerable<CategoryDto>> GetSubCategoriesAsync(int parentCategoryId)
        {
            try
            {
                var categories = await _categoryRepository.GetSubCategoriesAsync(parentCategoryId);
                return categories.Select(MapToCategoryDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting subcategories for parent: {ParentCategoryId}", parentCategoryId);
                throw;
            }
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
        {
            try
            {
                var category = await _categoryRepository.GetByIdAsync(id);
                return category != null ? MapToCategoryDto(category) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category by id: {CategoryId}", id);
                throw;
            }
        }

        public async Task<CategoryDto?> GetCategoryWithSubCategoriesAsync(int id)
        {
            try
            {
                var category = await _categoryRepository.GetWithSubCategoriesAsync(id);
                return category != null ? MapToCategoryDtoWithSubCategories(category) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category with subcategories: {CategoryId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
        {
            try
            {
                var categories = await _categoryRepository.GetActiveCategoriesAsync();
                return categories.Select(MapToCategoryDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all categories");
                throw;
            }
        }

        private CategoryDto MapToCategoryDto(Category category)
        {
            return new CategoryDto
            {
                Id = category.Id,
                NameEn = category.NameEn,
                NameAr = category.NameAr,
                DescriptionEn = category.DescriptionEn,
                DescriptionAr = category.DescriptionAr,
                ImageUrl = category.ImageUrl,
                ParentCategoryId = category.ParentCategoryId,
                ProductCount = category.Products?.Count ?? 0
            };
        }

        private CategoryDto MapToCategoryDtoWithSubCategories(Category category)
        {
            var dto = MapToCategoryDto(category);
            dto.SubCategories = category.SubCategories?.Select(MapToCategoryDto).ToList() ?? new List<CategoryDto>();
            return dto;
        }
    }
}

