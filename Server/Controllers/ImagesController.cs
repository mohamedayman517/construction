using ConstructionMarketplace.Data;
using ConstructionMarketplace.DTOs;
using ConstructionMarketplace.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConstructionMarketplace.Controllers
{
    [ApiController]
    [Route("api")] // we'll define full routes on actions
    public class ImagesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<ImagesController> _logger;

        public ImagesController(ApplicationDbContext db, ILogger<ImagesController> logger)
        {
            _db = db;
            _logger = logger;
        }

        // -------- Product Images --------

        [HttpPost("products/{productId:int}/images")]
        [Authorize(Roles = "Merchant")]
        public async Task<IActionResult> AddProductImage(int productId, [FromBody] AddProductImageDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid data." });

                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId)) return Unauthorized();

                var product = await _db.Products.Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == productId);
                if (product == null)
                    return NotFound(new { success = false, message = "Product not found." });

                if (product.MerchantId != userId)
                    return Forbid();

                var image = new ProductImage
                {
                    ProductId = productId,
                    ImageUrl = dto.ImageUrl,
                    AltText = dto.AltText,
                    IsPrimary = dto.IsPrimary,
                    SortOrder = dto.SortOrder,
                    CreatedAt = DateTime.UtcNow
                };

                // If setting as primary, unset others
                if (dto.IsPrimary)
                {
                    foreach (var img in product.Images)
                        img.IsPrimary = false;
                }

                await _db.ProductImages.AddAsync(image);
                await _db.SaveChangesAsync();

                return Ok(new { success = true, id = image.Id, url = image.ImageUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding product image");
                return StatusCode(500, new { success = false, message = "Failed to add image." });
            }
        }

        [HttpDelete("products/{productId:int}/images/{imageId:int}")]
        [Authorize(Roles = "Merchant")]
        public async Task<IActionResult> DeleteProductImage(int productId, int imageId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId)) return Unauthorized();

                var image = await _db.ProductImages.Include(i => i.Product).FirstOrDefaultAsync(i => i.Id == imageId && i.ProductId == productId);
                if (image == null)
                    return NotFound(new { success = false, message = "Image not found." });

                if (image.Product.MerchantId != userId)
                    return Forbid();

                _db.ProductImages.Remove(image);
                await _db.SaveChangesAsync();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product image");
                return StatusCode(500, new { success = false, message = "Failed to delete image." });
            }
        }

        // -------- Project Images --------

        [HttpPost("projects/{projectId:int}/images")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> AddProjectImage(int projectId, [FromBody] AddProjectImageDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { success = false, message = "Invalid data." });

                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId)) return Unauthorized();

                var project = await _db.Projects.Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == projectId);
                if (project == null)
                    return NotFound(new { success = false, message = "Project not found." });

                if (project.CustomerId != userId)
                    return Forbid();

                var image = new ProjectImage
                {
                    ProjectId = projectId,
                    ImageUrl = dto.ImageUrl,
                    Description = dto.Description,
                    SortOrder = dto.SortOrder,
                    CreatedAt = DateTime.UtcNow
                };

                await _db.ProjectImages.AddAsync(image);
                await _db.SaveChangesAsync();

                return Ok(new { success = true, id = image.Id, url = image.ImageUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding project image");
                return StatusCode(500, new { success = false, message = "Failed to add image." });
            }
        }

        [HttpDelete("projects/{projectId:int}/images/{imageId:int}")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> DeleteProjectImage(int projectId, int imageId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId)) return Unauthorized();

                var image = await _db.ProjectImages.Include(i => i.Project).FirstOrDefaultAsync(i => i.Id == imageId && i.ProjectId == projectId);
                if (image == null)
                    return NotFound(new { success = false, message = "Image not found." });

                if (image.Project.CustomerId != userId)
                    return Forbid();

                _db.ProjectImages.Remove(image);
                await _db.SaveChangesAsync();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting project image");
                return StatusCode(500, new { success = false, message = "Failed to delete image." });
            }
        }
    }
}
