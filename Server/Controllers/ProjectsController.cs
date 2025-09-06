using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ConstructionMarketplace.DTOs;
using ConstructionMarketplace.Services;

namespace ConstructionMarketplace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly IBidService _bidService;
        private readonly ILogger<ProjectsController> _logger;

        public ProjectsController(
            IProjectService projectService,
            IBidService bidService,
            ILogger<ProjectsController> logger)
        {
            _projectService = projectService;
            _bidService = bidService;
            _logger = logger;
        }

        /// <summary>
        /// Get projects with filtering and pagination
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<PagedResultDto<ProjectDto>>> GetProjects([FromQuery] SearchFilterDto filter)
        {
            try
            {
                var result = await _projectService.GetProjectsAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting projects");
                return StatusCode(500, new { success = false, message = "An error occurred while getting projects." });
            }
        }

        /// <summary>
        /// Get project by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDto>> GetProject(int id)
        {
            try
            {
                var project = await _projectService.GetProjectByIdAsync(id);
                
                if (project == null)
                {
                    return NotFound(new { success = false, message = "Project not found." });
                }

                // Increment view count
                await _projectService.IncrementViewCountAsync(id);

                return Ok(project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting project by id: {ProjectId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while getting the project." });
            }
        }

        /// <summary>
        /// Get open projects for bidding
        /// </summary>
        [HttpGet("open")]
        public async Task<ActionResult<IEnumerable<ProjectDto>>> GetOpenProjects()
        {
            try
            {
                var projects = await _projectService.GetOpenProjectsAsync();
                return Ok(projects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting open projects");
                return StatusCode(500, new { success = false, message = "An error occurred while getting open projects." });
            }
        }

        /// <summary>
        /// Create a new project (Customer only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<ProjectDto>> CreateProject([FromBody] CreateProjectDto createProjectDto)
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

                var project = await _projectService.CreateProjectAsync(userId, createProjectDto);
                return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating project");
                return StatusCode(500, new { success = false, message = "An error occurred while creating the project." });
            }
        }

        /// <summary>
        /// Update a project (Customer only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<ProjectDto>> UpdateProject(int id, [FromBody] CreateProjectDto updateProjectDto)
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

                var project = await _projectService.UpdateProjectAsync(id, userId, updateProjectDto);
                
                if (project == null)
                {
                    return NotFound(new { success = false, message = "Project not found or you don't have permission to update it." });
                }

                return Ok(project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating project: {ProjectId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while updating the project." });
            }
        }

        /// <summary>
        /// Delete a project (Customer only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult> DeleteProject(int id)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var result = await _projectService.DeleteProjectAsync(id, userId);
                
                if (!result)
                {
                    return NotFound(new { success = false, message = "Project not found or you don't have permission to delete it." });
                }

                return Ok(new { success = true, message = "Project deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting project: {ProjectId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while deleting the project." });
            }
        }

        /// <summary>
        /// Get customer's projects
        /// </summary>
        [HttpGet("customer/my-projects")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<IEnumerable<ProjectDto>>> GetMyProjects()
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var projects = await _projectService.GetProjectsByCustomerAsync(userId);
                return Ok(projects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer projects");
                return StatusCode(500, new { success = false, message = "An error occurred while getting your projects." });
            }
        }

        /// <summary>
        /// Select a bid for a project (Customer only)
        /// </summary>
        [HttpPost("{projectId}/select-bid/{bidId}")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult> SelectBid(int projectId, int bidId)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var result = await _projectService.SelectBidAsync(projectId, bidId, userId);
                
                if (!result)
                {
                    return BadRequest(new { success = false, message = "Failed to select bid." });
                }

                return Ok(new { success = true, message = "Bid selected successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error selecting bid: {BidId} for project: {ProjectId}", bidId, projectId);
                return StatusCode(500, new { success = false, message = "An error occurred while selecting the bid." });
            }
        }

        /// <summary>
        /// Get bids for a project
        /// </summary>
        [HttpGet("{projectId}/bids")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<BidDto>>> GetProjectBids(int projectId)
        {
            try
            {
                var bids = await _bidService.GetBidsByProjectAsync(projectId);
                return Ok(bids);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bids for project: {ProjectId}", projectId);
                return StatusCode(500, new { success = false, message = "An error occurred while getting project bids." });
            }
        }

        /// <summary>
        /// Create a bid for a project (Merchant only)
        /// </summary>
        [HttpPost("{projectId}/bids")]
        [Authorize(Roles = "Merchant")]
        public async Task<ActionResult<BidDto>> CreateBid(int projectId, [FromBody] CreateBidDto createBidDto)
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

                // Ensure the bid is for the correct project
                createBidDto.ProjectId = projectId;

                var bid = await _bidService.CreateBidAsync(userId, createBidDto);
                return CreatedAtAction(nameof(GetBid), new { id = bid.Id }, bid);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating bid for project: {ProjectId}", projectId);
                return StatusCode(500, new { success = false, message = "An error occurred while creating the bid." });
            }
        }

        /// <summary>
        /// Get bid by ID
        /// </summary>
        [HttpGet("bids/{id}")]
        [Authorize]
        public async Task<ActionResult<BidDto>> GetBid(int id)
        {
            try
            {
                var bid = await _bidService.GetBidByIdAsync(id);
                
                if (bid == null)
                {
                    return NotFound(new { success = false, message = "Bid not found." });
                }

                return Ok(bid);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bid by id: {BidId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while getting the bid." });
            }
        }

        /// <summary>
        /// Get merchant's bids
        /// </summary>
        [HttpGet("bids/merchant/my-bids")]
        [Authorize(Roles = "Merchant")]
        public async Task<ActionResult<IEnumerable<BidDto>>> GetMyBids()
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var bids = await _bidService.GetBidsByMerchantAsync(userId);
                return Ok(bids);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting merchant bids");
                return StatusCode(500, new { success = false, message = "An error occurred while getting your bids." });
            }
        }

        /// <summary>
        /// Withdraw a bid (Merchant only)
        /// </summary>
        [HttpPost("bids/{id}/withdraw")]
        [Authorize(Roles = "Merchant")]
        public async Task<ActionResult> WithdrawBid(int id)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var result = await _bidService.WithdrawBidAsync(id, userId);
                
                if (!result)
                {
                    return BadRequest(new { success = false, message = "Failed to withdraw bid." });
                }

                return Ok(new { success = true, message = "Bid withdrawn successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error withdrawing bid: {BidId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while withdrawing the bid." });
            }
        }

        /// <summary>
        /// Accept a bid (Customer only)
        /// </summary>
        [HttpPost("bids/{id}/accept")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult> AcceptBid(int id)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var result = await _bidService.AcceptBidAsync(id, userId);
                
                if (!result)
                {
                    return BadRequest(new { success = false, message = "Failed to accept bid." });
                }

                return Ok(new { success = true, message = "Bid accepted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error accepting bid: {BidId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while accepting the bid." });
            }
        }

        /// <summary>
        /// Reject a bid (Customer only)
        /// </summary>
        [HttpPost("bids/{id}/reject")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult> RejectBid(int id, [FromBody] string reason)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var result = await _bidService.RejectBidAsync(id, userId, reason);
                
                if (!result)
                {
                    return BadRequest(new { success = false, message = "Failed to reject bid." });
                }

                return Ok(new { success = true, message = "Bid rejected successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting bid: {BidId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while rejecting the bid." });
            }
        }
    }
}

