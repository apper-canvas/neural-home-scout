import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import { propertyService } from "@/services/api/propertyService";
const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImageLoading, setMainImageLoading] = useState(true);
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbnailStates, setThumbnailStates] = useState({});
const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [savedProperties, setSavedProperties] = useLocalStorage('savedProperties', []);

  const updateThumbnailState = (index, state) => {
    setThumbnailStates(prev => ({
      ...prev,
      [index]: { ...prev[index], ...state }
    }));
  };

const loadProperty = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const data = await propertyService.getById(parseInt(id));
      setProperty(data);
    } catch (err) {
      setError("Failed to load property details. Please try again.");
      console.error("Error loading property:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!property) return;
    
    const newSavedProperties = savedProperties.includes(property.Id)
      ? savedProperties.filter(savedId => savedId !== property.Id)
      : [...savedProperties, property.Id];
    
    setSavedProperties(newSavedProperties);
    
    toast.success(
      savedProperties.includes(property.Id)
        ? "Property removed from favorites"
        : "Property added to favorites"
    );
  };

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

  const nextImage = () => {
    if (property?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
      setMainImageLoading(true);
      setMainImageError(false);
    }
  };

  const prevImage = () => {
    if (property?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
      setMainImageLoading(true);
      setMainImageError(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-xl mb-8 shimmer"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-8 bg-gray-200 rounded shimmer"></div>
              <div className="h-6 bg-gray-200 rounded shimmer"></div>
              <div className="h-32 bg-gray-200 rounded shimmer"></div>
            </div>
            <div className="space-y-6">
              <div className="h-40 bg-gray-200 rounded shimmer"></div>
              <div className="h-40 bg-gray-200 rounded shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Error message={error} onRetry={loadProperty} />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Error message="Property not found." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/browse" className="hover:text-primary transition-colors">
            Properties
          </Link>
          <ApperIcon name="ChevronRight" className="w-4 h-4" />
          <span className="text-gray-900">{property.title}</span>
        </div>
      </nav>

      {/* Image Gallery */}
      <div className="relative mb-8">
<div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-xl overflow-hidden">
          <div className="relative">
            {mainImageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={mainImageError ? 'https://via.placeholder.com/800x600/e5e7eb/9ca3af?text=Property+Image' : property.images?.[currentImageIndex] || 'https://via.placeholder.com/800x600/e5e7eb/9ca3af?text=No+Image'}
              alt={`${property.title} - Image ${currentImageIndex + 1} of ${property.images?.length || 0}`}
              className={cn(
                "w-full h-96 object-cover transition-all duration-200",
                mainImageLoading && "opacity-0",
                mainImageError && "opacity-75"
              )}
              onLoad={() => setMainImageLoading(false)}
              onError={() => {
                setMainImageError(true);
                setMainImageLoading(false);
              }}
              onLoadStart={() => {
                setMainImageLoading(true);
                setMainImageError(false);
              }}
            />
          </div>
        </div>
        
{property?.images?.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200"
            >
              <ApperIcon name="ChevronLeft" className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200"
            >
              <ApperIcon name="ChevronRight" className="w-6 h-6 text-gray-700" />
            </button>
          </>
        )}
        
        {/* Image indicators */}
{property?.images?.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
{property?.images?.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentImageIndex
                    ? "bg-white scale-110"
                    : "bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
{property?.images?.length > 1 && (
        <div className="flex space-x-2 mb-8 overflow-x-auto">
{property?.images?.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentImageIndex
                  ? "border-primary"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
<div className="relative">
                {thumbnailStates[index]?.loading && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={thumbnailStates[index]?.error ? 'https://via.placeholder.com/150x150/e5e7eb/9ca3af?text=Thumb' : image || 'https://via.placeholder.com/150x150/e5e7eb/9ca3af?text=No+Image'}
                  alt={`${property.title} - Thumbnail ${index + 1} of ${property.images?.length || 0}`}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-200",
                    thumbnailStates[index]?.loading && "opacity-0",
                    thumbnailStates[index]?.error && "opacity-75"
                  )}
                  loading="lazy"
                  onLoad={() => updateThumbnailState(index, { loading: false })}
                  onError={() => updateThumbnailState(index, { error: true, loading: false })}
                  onLoadStart={() => updateThumbnailState(index, { loading: true, error: false })}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Property Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-card p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Badge variant="default" className="property-type-badge">
                    {property.type}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Built in {property.yearBuilt}
                  </span>
                </div>
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center text-gray-600">
                  <ApperIcon name="MapPin" className="w-5 h-5 mr-2" />
                  <span>
                    {property.address.street}, {property.address.city}, {property.address.state} {property.address.zipCode}
                  </span>
                </div>
              </div>
              <button
                onClick={handleToggleFavorite}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                  savedProperties.includes(property.Id)
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <ApperIcon 
                  name="Heart" 
                  className={`w-6 h-6 ${savedProperties.includes(property.Id) ? "fill-current" : ""}`}
                />
              </button>
            </div>

            <div className="price-highlight text-3xl font-bold mb-8">
              {formatPrice(property.price)}
            </div>

            {/* Property Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ApperIcon name="Bed" className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                <div className="text-sm text-gray-600">Bedrooms</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ApperIcon name="Bath" className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                <div className="text-sm text-gray-600">Bathrooms</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ApperIcon name="Square" className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatSquareFeet(property.squareFeet)}</div>
                <div className="text-sm text-gray-600">Square Feet</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ApperIcon name="Calendar" className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{property.yearBuilt}</div>
                <div className="text-sm text-gray-600">Year Built</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {property.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <ApperIcon name="Check" className="w-5 h-5 text-primary mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Listing Information */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Listing Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Listed on:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {format(new Date(property.listingDate), "MMMM d, yyyy")}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Property ID:</span>
                  <span className="ml-2 text-gray-900 font-medium">#{property.Id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Agent</h3>
            <div className="space-y-4">
              <Button className="w-full">
                <ApperIcon name="Phone" className="w-4 h-4 mr-2" />
                Call Agent
              </Button>
              <Button variant="outline" className="w-full">
                <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button variant="secondary" className="w-full">
                <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
                Schedule Tour
              </Button>
            </div>
          </div>

          {/* Mortgage Calculator */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mortgage Calculator</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Home Price
                </label>
                <div className="text-lg font-semibold text-primary">
                  {formatPrice(property.price)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Down Payment (20%)
                </label>
                <div className="text-lg font-semibold text-gray-900">
                  {formatPrice(property.price * 0.2)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Est. Monthly Payment
                </label>
                <div className="text-lg font-semibold text-accent">
                  {formatPrice((property.price * 0.8 * 0.005) + (property.price * 0.005 / 12))}
                </div>
              </div>
              <Button variant="accent" className="w-full">
                <ApperIcon name="Calculator" className="w-4 h-4 mr-2" />
                Full Calculator
              </Button>
            </div>
          </div>

          {/* Map Preview */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-4">
              <div className="w-full h-32 bg-gradient-to-r from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                <ApperIcon name="Map" className="w-12 h-12 text-primary" />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {property.address.street}, {property.address.city}, {property.address.state}
            </div>
            <Button variant="outline" className="w-full">
              <ApperIcon name="MapPin" className="w-4 h-4 mr-2" />
              View on Map
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;