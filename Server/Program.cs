using System.Reflection;
using Controllers;
using Microsoft.AspNetCore.Mvc;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers(); 
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi(options =>
{
    options.ShouldInclude = description =>
    {
        if (builder.Environment.IsDevelopment())
        {
            return true;
        }

        return description.GroupName != "internal";
    };
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowDashboard", policy =>
    {

        policy.WithOrigins("http://localhost:3001")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();
app.UseRouting(); 
app.UseDeveloperExceptionPage();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "OpenAPI V1");
    });

    app.UseReDoc(options =>
    {
        options.SpecUrl("/openapi/v1.json");
    });

    app.MapScalarApiReference(options =>
    {
        options.WithOpenApiRoutePattern("/openapi/{documentName}.json");
    });
}

app.UseCors("AllowDashboard");

// Middlewares
app.UseMiddleware<Middlewares.GlobalMiddleware>();

// Services

app.UseHttpsRedirection();

app.MapControllers();

app.Run();