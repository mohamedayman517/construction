# Construction Marketplace - ASP.NET Core API

A comprehensive e-commerce and service marketplace platform specifically designed for the architecture and construction industry. This backend API supports a multi-role system with advanced features including project bidding, equipment rentals, service requests, and integrated accounting for merchants.

## 🏗️ Project Overview

The Construction Marketplace is a robust platform that connects customers, merchants, workers, and administrators in the construction industry. It facilitates product sales, custom project requests, equipment rentals, and service hiring through a modern web API built with ASP.NET Core.

### Key Features

- **Multi-Role System**: Customer, Merchant, Worker, and Admin roles with specific permissions
- **Product Catalog**: Comprehensive product management with categories and custom dimensions
- **Project Bidding**: Custom project requests with merchant bidding system
- **Service Marketplace**: Workers can apply for service requests posted by merchants
- **Equipment Rentals**: Merchants can rent out tools and equipment to customers
- **Accounting System**: Subscription-based accounting features for merchants
- **Multi-Language Support**: Arabic and English support in database structure
- **JWT Authentication**: Secure role-based authentication and authorization
- **Clean Architecture**: Repository pattern, service layer, and dependency injection

## 🚀 Technology Stack

- **Framework**: ASP.NET Core 8.0 Web API
- **Database**: Microsoft SQL Server with Entity Framework Core
- **Authentication**: JWT Bearer tokens with ASP.NET Core Identity
- **Architecture**: Clean Architecture with Repository and Service patterns
- **Documentation**: Swagger/OpenAPI integration
- **Logging**: Serilog with file and console outputs
- **Validation**: FluentValidation for request validation
- **Mapping**: AutoMapper for object mapping

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (LocalDB for development)
- [Visual Studio 2022](https://visualstudio.microsoft.com/) or [Visual Studio Code](https://code.visualstudio.com/)
- [SQL Server Management Studio](https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) (optional)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ConstructionMarketplace
```

### 2. Configure Database Connection

Update the connection string in `appsettings.json` and `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ConstructionMarketplaceDb;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

For production, use a full SQL Server instance:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-server;Database=ConstructionMarketplaceDb;User Id=your-username;Password=your-password;TrustServerCertificate=true;"
  }
}
```

### 3. Configure JWT Settings

Update JWT configuration in `appsettings.json`:

```json
{
  "Jwt": {
    "Key": "YourSecretKeyHere-MustBeAtLeast32Characters",
    "Issuer": "ConstructionMarketplace",
    "Audience": "ConstructionMarketplaceUsers",
    "ExpireDays": 7
  }
}
```

### 4. Install Dependencies

```bash
dotnet restore
```

### 5. Create and Migrate Database

```bash
# Add initial migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

### 6. Run the Application

```bash
dotnet run
```

The API will be available at:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `http://localhost:5000/swagger`

## 👥 User Roles & Permissions

### Customer
- Browse and search products
- Create custom project requests
- Receive and evaluate bids from merchants
- Rent equipment from merchants
- Leave reviews and ratings

### Merchant
- Create and manage product listings
- Bid on customer projects
- Post service requests to hire workers
- Rent out equipment to customers
- Access accounting features (with subscription)
- Manage inventory and invoices

### Worker
- Browse and apply for service requests
- Manage work applications and schedules
- Build professional profile and portfolio

### Admin
- Manage all users and permissions
- Oversee platform operations
- Manage categories and system settings
- Access comprehensive analytics

## 🗄️ Database Schema

The database includes the following main entities:

### Core Entities
- **ApplicationUser**: Extended Identity user with business properties
- **Category**: Hierarchical product/project categories (multi-language)
- **Product**: Product catalog with custom dimensions support
- **Project**: Customer project requests for custom work
- **Bid**: Merchant bids on customer projects

### Business Entities
- **ServiceRequest**: Job postings by merchants for workers
- **ServiceApplication**: Worker applications for service requests
- **Rental**: Equipment rental transactions
- **Review**: User reviews and ratings system
- **Order**: Product purchase orders

### Accounting Entities (Subscription Feature)
- **Invoice**: Sales and purchase invoices
- **InvoiceItem**: Line items for invoices
- **Payment**: Payment records
- **Expense**: Business expense tracking
- **Salary**: Employee salary records
- **InventoryItem**: Inventory management
- **InventoryMovement**: Stock movement tracking

## 🔐 Authentication & Authorization

The API uses JWT Bearer token authentication with role-based authorization:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh-token` - Token refresh
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Authorization
Controllers and actions are protected with `[Authorize]` attributes and role-based permissions:

```csharp
[Authorize(Roles = "Merchant")]
public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createProductDto)
```

## 📚 API Documentation

### Main API Endpoints

#### Products
- `GET /api/products` - Get products with filtering and pagination
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product (Merchant only)
- `PUT /api/products/{id}` - Update product (Merchant only)
- `DELETE /api/products/{id}` - Delete product (Merchant only)

#### Categories
- `GET /api/categories` - Get root categories
- `GET /api/categories/{id}` - Get category by ID
- `GET /api/categories/{id}/with-subcategories` - Get category with subcategories

#### Projects
- `GET /api/projects` - Get projects with filtering
- `GET /api/projects/{id}` - Get project by ID
- `POST /api/projects` - Create project (Customer only)
- `GET /api/projects/open` - Get open projects for bidding

#### Bids
- `GET /api/projects/{projectId}/bids` - Get bids for project
- `POST /api/projects/{projectId}/bids` - Create bid (Merchant only)
- `POST /api/projects/bids/{id}/accept` - Accept bid (Customer only)
- `POST /api/projects/bids/{id}/reject` - Reject bid (Customer only)

### Request/Response Examples

#### User Registration
```json
POST /api/auth/register
{
  "email": "merchant@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Builder",
  "role": "Merchant",
  "companyName": "Builder's Supply Co.",
  "phoneNumber": "+1234567890"
}
```

#### Create Product
```json
POST /api/products
Authorization: Bearer <jwt-token>
{
  "nameEn": "Premium Steel Door",
  "nameAr": "باب فولاذي ممتاز",
  "descriptionEn": "High-quality steel door with advanced security features",
  "descriptionAr": "باب فولاذي عالي الجودة مع ميزات أمان متقدمة",
  "categoryId": 3,
  "price": 299.99,
  "stockQuantity": 50,
  "allowCustomDimensions": true,
  "isAvailableForRent": false,
  "attributes": [
    {
      "nameEn": "Material",
      "nameAr": "المادة",
      "valueEn": "Steel",
      "valueAr": "فولاذ"
    }
  ]
}
```

## 🏗️ Architecture Overview

The project follows Clean Architecture principles with clear separation of concerns:

```
ConstructionMarketplace/
├── Controllers/          # API Controllers
├── Services/            # Business Logic Services
├── Repositories/        # Data Access Layer
├── Models/             # Entity Models
├── DTOs/               # Data Transfer Objects
├── Data/               # DbContext and Database Configuration
├── Middleware/         # Custom Middleware
├── Extensions/         # Extension Methods
└── Configurations/     # Configuration Classes
```

### Key Design Patterns
- **Repository Pattern**: Abstraction over data access
- **Service Layer Pattern**: Business logic separation
- **Dependency Injection**: Loose coupling and testability
- **DTO Pattern**: API contract definition
- **Middleware Pattern**: Cross-cutting concerns

## 🔧 Configuration

### Environment Variables
For production deployment, consider using environment variables:

```bash
export ConnectionStrings__DefaultConnection="Server=prod-server;Database=ConstructionMarketplaceDb;..."
export Jwt__Key="YourProductionSecretKey"
export Email__SmtpUsername="your-email@domain.com"
export Email__SmtpPassword="your-email-password"
```

### File Upload Configuration
Configure file upload settings in `appsettings.json`:

```json
{
  "FileUpload": {
    "MaxFileSize": 10485760,
    "AllowedExtensions": [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx"],
    "UploadPath": "wwwroot/uploads"
  }
}
```

## 📊 Logging

The application uses Serilog for structured logging:

- Console logging for development
- File logging with daily rolling files
- Structured logging with contextual information

Logs are stored in the `logs/` directory with daily rotation.

## 🧪 Testing

### Running Tests
```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Test Structure
- Unit tests for services and repositories
- Integration tests for controllers
- Database tests with in-memory provider

## 🚀 Deployment

### Production Deployment Steps

1. **Build the application**:
```bash
dotnet publish -c Release -o ./publish
```

2. **Configure production database**:
Update connection strings and run migrations on production database.

3. **Set environment variables**:
Configure all sensitive settings via environment variables.

4. **Deploy to hosting platform**:
- Azure App Service
- AWS Elastic Beanstalk
- Docker containers
- IIS on Windows Server

### Docker Deployment
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ConstructionMarketplace.csproj", "."]
RUN dotnet restore "./ConstructionMarketplace.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "ConstructionMarketplace.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ConstructionMarketplace.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ConstructionMarketplace.dll"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation and API reference

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - User authentication and authorization
  - Product catalog management
  - Project bidding system
  - Basic accounting features

---

**Built with ❤️ for the Construction Industry**

