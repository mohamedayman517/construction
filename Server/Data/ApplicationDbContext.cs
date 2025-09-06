using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ConstructionMarketplace.Models;

namespace ConstructionMarketplace.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // DbSets for all entities
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<ProductImage> ProductImages { get; set; } = null!;
        public DbSet<ProductAttribute> ProductAttributes { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<ProjectImage> ProjectImages { get; set; } = null!;
        public DbSet<ProjectUpdate> ProjectUpdates { get; set; } = null!;
        public DbSet<Bid> Bids { get; set; } = null!;
        public DbSet<ServiceRequest> ServiceRequests { get; set; } = null!;
        public DbSet<ServiceApplication> ServiceApplications { get; set; } = null!;
        public DbSet<Rental> Rentals { get; set; } = null!;
        public DbSet<RentalImage> RentalImages { get; set; } = null!;
        public DbSet<RentalPayment> RentalPayments { get; set; } = null!;
        public DbSet<Review> Reviews { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<OrderItem> OrderItems { get; set; } = null!;
        public DbSet<Invoice> Invoices { get; set; } = null!;
        public DbSet<InvoiceItem> InvoiceItems { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;
        public DbSet<Expense> Expenses { get; set; } = null!;
        public DbSet<Salary> Salaries { get; set; } = null!;
        public DbSet<InventoryItem> InventoryItems { get; set; } = null!;
        public DbSet<InventoryMovement> InventoryMovements { get; set; } = null!;
        public DbSet<Address> Addresses { get; set; } = null!;
        public DbSet<WishlistItem> WishlistItems { get; set; } = null!;
        public DbSet<Offer> Offers { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure Category relationships
            builder.Entity<Category>()
                .HasOne(c => c.ParentCategory)
                .WithMany(c => c.SubCategories)
                .HasForeignKey(c => c.ParentCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Product relationships
            builder.Entity<Product>()
                .HasOne(p => p.Merchant)
                .WithMany(u => u.Products)
                .HasForeignKey(p => p.MerchantId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure ProductImage relationships
            builder.Entity<ProductImage>()
                .HasOne(pi => pi.Product)
                .WithMany(p => p.Images)
                .HasForeignKey(pi => pi.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure ProductAttribute relationships
            builder.Entity<ProductAttribute>()
                .HasOne(pa => pa.Product)
                .WithMany(p => p.Attributes)
                .HasForeignKey(pa => pa.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Project relationships
            builder.Entity<Project>()
                .HasOne(p => p.Customer)
                .WithMany(u => u.CustomerProjects)
                .HasForeignKey(p => p.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Project>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Projects)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Project>()
                .HasOne(p => p.SelectedBid)
                .WithMany()
                .HasForeignKey(p => p.SelectedBidId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure ProjectImage relationships
            builder.Entity<ProjectImage>()
                .HasOne(pi => pi.Project)
                .WithMany(p => p.Images)
                .HasForeignKey(pi => pi.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure ProjectUpdate relationships
            builder.Entity<ProjectUpdate>()
                .HasOne(pu => pu.Project)
                .WithMany(p => p.Updates)
                .HasForeignKey(pu => pu.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Bid relationships
            builder.Entity<Bid>()
                .HasOne(b => b.Project)
                .WithMany(p => p.Bids)
                .HasForeignKey(b => b.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Bid>()
                .HasOne(b => b.Merchant)
                .WithMany(u => u.Bids)
                .HasForeignKey(b => b.MerchantId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Bid>()
                .HasOne(b => b.OriginalBid)
                .WithMany(b => b.CounterOffers)
                .HasForeignKey(b => b.OriginalBidId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure ServiceRequest relationships
            builder.Entity<ServiceRequest>()
                .HasOne(sr => sr.Merchant)
                .WithMany(u => u.ServiceRequests)
                .HasForeignKey(sr => sr.MerchantId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure ServiceApplication relationships
            builder.Entity<ServiceApplication>()
                .HasOne(sa => sa.ServiceRequest)
                .WithMany(sr => sr.Applications)
                .HasForeignKey(sa => sa.ServiceRequestId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ServiceApplication>()
                .HasOne(sa => sa.Worker)
                .WithMany(u => u.ServiceApplications)
                .HasForeignKey(sa => sa.WorkerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Rental relationships
            builder.Entity<Rental>()
                .HasOne(r => r.Product)
                .WithMany(p => p.Rentals)
                .HasForeignKey(r => r.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Rental>()
                .HasOne(r => r.Customer)
                .WithMany(u => u.CustomerRentals)
                .HasForeignKey(r => r.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Rental>()
                .HasOne(r => r.Merchant)
                .WithMany(u => u.MerchantRentals)
                .HasForeignKey(r => r.MerchantId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure RentalImage relationships
            builder.Entity<RentalImage>()
                .HasOne(ri => ri.Rental)
                .WithMany(r => r.Images)
                .HasForeignKey(ri => ri.RentalId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure RentalPayment relationships
            builder.Entity<RentalPayment>()
                .HasOne(rp => rp.Rental)
                .WithMany(r => r.Payments)
                .HasForeignKey(rp => rp.RentalId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Review relationships
            builder.Entity<Review>()
                .HasOne(r => r.Reviewer)
                .WithMany(u => u.GivenReviews)
                .HasForeignKey(r => r.ReviewerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Review>()
                .HasOne(r => r.Reviewee)
                .WithMany(u => u.ReceivedReviews)
                .HasForeignKey(r => r.RevieweeId)
                .OnDelete(DeleteBehavior.Restrict);
            // Use Restrict on nullable review relationships to avoid multiple cascade paths
            builder.Entity<Review>()
                .HasOne(r => r.Product)
                .WithMany(p => p.Reviews)
                .HasForeignKey(r => r.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Review>()
                .HasOne(r => r.Project)
                .WithMany()
                .HasForeignKey(r => r.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Review>()
                .HasOne(r => r.ServiceRequest)
                .WithMany()
                .HasForeignKey(r => r.ServiceRequestId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Review>()
                .HasOne(r => r.Rental)
                .WithMany()
                .HasForeignKey(r => r.RentalId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Order relationships
            builder.Entity<Order>()
                .HasOne(o => o.Customer)
                .WithMany()
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Order>()
                .HasOne(o => o.Merchant)
                .WithMany()
                .HasForeignKey(o => o.MerchantId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure OrderItem relationships
            builder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<OrderItem>()
                .HasOne(oi => oi.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Invoice relationships
            builder.Entity<Invoice>()
                .HasOne(i => i.Merchant)
                .WithMany(u => u.MerchantInvoices)
                .HasForeignKey(i => i.MerchantId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Invoice>()
                .HasOne(i => i.Customer)
                .WithMany(u => u.CustomerInvoices)
                .HasForeignKey(i => i.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure InvoiceItem relationships
            builder.Entity<InvoiceItem>()
                .HasOne(ii => ii.Invoice)
                .WithMany(i => i.Items)
                .HasForeignKey(ii => ii.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<InvoiceItem>()
                .HasOne(ii => ii.Product)
                .WithMany()
                .HasForeignKey(ii => ii.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Payment relationships
            builder.Entity<Payment>()
                .HasOne(p => p.Invoice)
                .WithMany(i => i.Payments)
                .HasForeignKey(p => p.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Expense relationships
            builder.Entity<Expense>()
                .HasOne(e => e.Merchant)
                .WithMany(u => u.Expenses)
                .HasForeignKey(e => e.MerchantId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Salary relationships
            builder.Entity<Salary>()
                .HasOne(s => s.Merchant)
                .WithMany(u => u.Salaries)
                .HasForeignKey(s => s.MerchantId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Salary>()
                .HasOne(s => s.Employee)
                .WithMany()
                .HasForeignKey(s => s.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure InventoryItem relationships
            builder.Entity<InventoryItem>()
                .HasOne(ii => ii.Merchant)
                .WithMany()
                .HasForeignKey(ii => ii.MerchantId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<InventoryItem>()
                .HasOne(ii => ii.Product)
                .WithMany()
                .HasForeignKey(ii => ii.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure InventoryMovement relationships
            builder.Entity<InventoryMovement>()
                .HasOne(im => im.InventoryItem)
                .WithMany(ii => ii.Movements)
                .HasForeignKey(im => im.InventoryItemId)
                .OnDelete(DeleteBehavior.Cascade);

            // Addresses
            builder.Entity<Address>()
                .HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Wishlist
            builder.Entity<WishlistItem>()
                .HasIndex(w => new { w.UserId, w.ProductId })
                .IsUnique();
            builder.Entity<WishlistItem>()
                .HasOne(w => w.User)
                .WithMany()
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.Entity<WishlistItem>()
                .HasOne(w => w.Product)
                .WithMany()
                .HasForeignKey(w => w.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // Offers (technician offers)
            builder.Entity<Offer>()
                .HasOne(o => o.Technician)
                .WithMany()
                .HasForeignKey(o => o.TechnicianId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure indexes for better performance
            builder.Entity<Product>()
                .HasIndex(p => p.SKU)
                .IsUnique();

            // Set decimal precisions to avoid SQL Server truncation warnings
            builder.Entity<ApplicationUser>()
                .Property(u => u.Rating)
                .HasColumnType("decimal(18,2)");

            builder.Entity<Product>()
                .Property(p => p.AverageRating)
                .HasColumnType("decimal(18,2)");

            builder.Entity<Product>()
                .HasIndex(p => p.Slug)
                .IsUnique();

            builder.Entity<Invoice>()
                .HasIndex(i => i.InvoiceNumber)
                .IsUnique();

            builder.Entity<Order>()
                .HasIndex(o => o.OrderNumber)
                .IsUnique();

            builder.Entity<InventoryItem>()
                .HasIndex(ii => ii.SKU);

            builder.Entity<InventoryItem>()
                .HasIndex(ii => ii.Barcode);
        }
    }
}

