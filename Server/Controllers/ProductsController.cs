using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ConstructionMarketplace.DTOs;
using ConstructionMarketplace.Services;

namespace ConstructionMarketplace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ICategoryService _categoryService;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(
            IProductService productService,
            ICategoryService categoryService,
            ILogger<ProductsController> logger)
        {
            _productService = productService;
            _categoryService = categoryService;
            _logger = logger;
        }

        /// <summary>
        /// Get products with filtering and pagination
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<PagedResultDto<ProductDto>>> GetProducts([FromQuery] SearchFilterDto filter)
        {
            try
            {
                var result = await _productService.GetProductsAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting products");
                return StatusCode(500, new { success = false, message = "An error occurred while getting products." });
            }
        }

        /// <summary>
        /// Get product by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            try
            {
                var product = await _productService.GetProductByIdAsync(id);
                
                if (product == null)
                {
                    return NotFound(new { success = false, message = "Product not found." });
                }

                // Increment view count
                await _productService.IncrementViewCountAsync(id);

                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product by id: {ProductId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while getting the product." });
            }
        }

        /// <summary>
        /// Get product by slug
        /// </summary>
        [HttpGet("slug/{slug}")]
        public async Task<ActionResult<ProductDto>> GetProductBySlug(string slug)
        {
            try
            {
                var product = await _productService.GetProductBySlugAsync(slug);
                
                if (product == null)
                {
                    return NotFound(new { success = false, message = "Product not found." });
                }

                // Increment view count
                await _productService.IncrementViewCountAsync(product.Id);

                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product by slug: {Slug}", slug);
                return StatusCode(500, new { success = false, message = "An error occurred while getting the product." });
            }
        }

        /// <summary>
        /// Get products by category
        /// </summary>
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProductsByCategory(int categoryId)
        {
            try
            {
                var products = await _productService.GetProductsByCategoryAsync(categoryId);
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting products by category: {CategoryId}", categoryId);
                return StatusCode(500, new { success = false, message = "An error occurred while getting products." });
            }
        }

        /// <summary>
        /// Get featured products
        /// </summary>
        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetFeaturedProducts()
        {
            try
            {
                var products = await _productService.GetFeaturedProductsAsync();
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured products");
                return StatusCode(500, new { success = false, message = "An error occurred while getting featured products." });
            }
        }

        /// <summary>
        /// Get products available for rent
        /// </summary>
        [HttpGet("rentals")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetAvailableForRent()
        {
            try
            {
                var products = await _productService.GetAvailableForRentAsync();
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting products available for rent");
                return StatusCode(500, new { success = false, message = "An error occurred while getting rental products." });
            }
        }

        /// <summary>
        /// Create a new product (Merchant only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Merchant")]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createProductDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "Invalid input data." });
                }

                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var product = await _productService.CreateProductAsync(userId, createProductDto);
                return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product");
                return StatusCode(500, new { success = false, message = "An error occurred while creating the product." });
            }
        }

        /// <summary>
        /// Update a product (Merchant only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Merchant")]
        public async Task<ActionResult<ProductDto>> UpdateProduct(int id, [FromBody] CreateProductDto updateProductDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, message = "Invalid input data." });
                }

                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var product = await _productService.UpdateProductAsync(id, userId, updateProductDto);
                
                if (product == null)
                {
                    return NotFound(new { success = false, message = "Product not found or you don't have permission to update it." });
                }

                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product: {ProductId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while updating the product." });
            }
        }

        /// <summary>
        /// Delete a product (Merchant only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Merchant")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var result = await _productService.DeleteProductAsync(id, userId);
                
                if (!result)
                {
                    return NotFound(new { success = false, message = "Product not found or you don't have permission to delete it." });
                }

                return Ok(new { success = true, message = "Product deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product: {ProductId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while deleting the product." });
            }
        }

        /// <summary>
        /// Get merchant's products
        /// </summary>
        [HttpGet("merchant/my-products")]
        [Authorize(Roles = "Merchant")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetMyProducts()
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var products = await _productService.GetProductsByMerchantAsync(userId);
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting merchant products");
                return StatusCode(500, new { success = false, message = "An error occurred while getting your products." });
            }
        }

        /// <summary>
        /// Update product stock
        /// </summary>
        [HttpPatch("{id}/stock")]
        [Authorize(Roles = "Merchant")]
        public async Task<ActionResult> UpdateStock(int id, [FromBody] int newStock)
        {
            try
            {
                var result = await _productService.UpdateStockAsync(id, newStock);
                
                if (!result)
                {
                    return NotFound(new { success = false, message = "Product not found." });
                }

                return Ok(new { success = true, message = "Stock updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stock for product: {ProductId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while updating stock." });
            }
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly ILogger<CategoriesController> _logger;

        public CategoriesController(ICategoryService categoryService, ILogger<CategoriesController> logger)
        {
            _categoryService = categoryService;
            _logger = logger;
        }

        /// <summary>
        /// Get all root categories
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetRootCategories()
        {
            try
            {
                var categories = await _categoryService.GetRootCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting root categories");
                return StatusCode(500, new { success = false, message = "An error occurred while getting categories." });
            }
        }

        /// <summary>
        /// Get category by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryByIdAsync(id);
                
                if (category == null)
                {
                    return NotFound(new { success = false, message = "Category not found." });
                }

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category by id: {CategoryId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while getting the category." });
            }
        }

        /// <summary>
        /// Get category with subcategories
        /// </summary>
        [HttpGet("{id}/with-subcategories")]
        public async Task<ActionResult<CategoryDto>> GetCategoryWithSubCategories(int id)
        {
            try
            {
                var category = await _categoryService.GetCategoryWithSubCategoriesAsync(id);
                
                if (category == null)
                {
                    return NotFound(new { success = false, message = "Category not found." });
                }

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category with subcategories: {CategoryId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while getting the category." });
            }
        }

        /// <summary>
        /// Get subcategories of a parent category
        /// </summary>
        [HttpGet("{parentId}/subcategories")]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetSubCategories(int parentId)
        {
            try
            {
                var categories = await _categoryService.GetSubCategoriesAsync(parentId);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting subcategories for parent: {ParentId}", parentId);
                return StatusCode(500, new { success = false, message = "An error occurred while getting subcategories." });
            }
        }

        /// <summary>
        /// Get all categories (flat list)
        /// </summary>
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAllCategories()
        {
            try
            {
                var categories = await _categoryService.GetAllCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all categories");
                return StatusCode(500, new { success = false, message = "An error occurred while getting categories." });
            }
        }
    }
}

