import React, { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
const PropertyCard = ({ property, isFavorite, onToggleFavorite, viewMode = "grid", className }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatSquareFeet = (sqft) => {
    return new Intl.NumberFormat("en-US").format(sqft);
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(property.Id);
  };

  return (
    <div className={cn("property-card group", className)}>
      <Link to={`/property/${property.Id}`}>
        <div className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-hover transition-all duration-200">
<div className="relative">
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-t-xl flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={imageError ? 'https://via.placeholder.com/800x600/e5e7eb/9ca3af?text=Property+Image' : property.images?.[0] || 'https://via.placeholder.com/800x600/e5e7eb/9ca3af?text=No+Image'}
              alt={`${property.title} - ${property.type} in ${property.address?.city || 'Unknown location'}`}
              className={cn(
                "property-image w-full h-48 object-cover transition-all duration-200",
                imageLoading && "opacity-0",
                imageError && "opacity-75"
              )}
              loading="lazy"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
            <div className="absolute top-3 left-3">
              <Badge variant="default" className="property-type-badge">
                {property.type}
              </Badge>
            </div>
            <button
              onClick={handleFavoriteClick}
              className={cn(
                "favorite-button absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200",
                isFavorite 
                  ? "bg-red-500 text-white" 
                  : "bg-white/80 text-gray-600 hover:bg-white"
              )}
            >
              <ApperIcon 
                name={isFavorite ? "Heart" : "Heart"} 
                className={cn("w-5 h-5", isFavorite && "fill-current")}
              />
            </button>
          </div>
          
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-display font-semibold text-lg text-gray-900 line-clamp-2">
                {property.title}
              </h3>
            </div>
            
            <div className="price-highlight mb-3">
              {formatPrice(property.price)}
            </div>
            
            <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
              <div className="flex items-center">
                <ApperIcon name="Bed" className="w-4 h-4 mr-1" />
                <span>{property.bedrooms} bed</span>
              </div>
              <div className="flex items-center">
                <ApperIcon name="Bath" className="w-4 h-4 mr-1" />
                <span>{property.bathrooms} bath</span>
              </div>
              <div className="flex items-center">
                <ApperIcon name="Square" className="w-4 h-4 mr-1" />
                <span>{formatSquareFeet(property.squareFeet)} sqft</span>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <ApperIcon name="MapPin" className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">
                {property.address.street}, {property.address.city}, {property.address.state}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Listed {format(new Date(property.listingDate), "MMM d, yyyy")}
              </div>
              <div className="flex items-center text-sm text-primary hover:text-primary-600 transition-colors">
                <span className="mr-1">View Details</span>
                <ApperIcon name="ChevronRight" className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;