import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useLocation, useSearch } from "wouter";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Booking } from "@shared/schema";

// Extend the insertBookingSchema for form validation
const bookingFormSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  returnDate: z.string().optional(),
  travelClass: z.enum(["economy", "luxury", "vip"], {
    required_error: "Travel class is required",
  }),
  numberOfTravelers: z.coerce.number().min(1, "At least 1 traveler is required").max(10, "Maximum 10 travelers allowed"),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

type BookingFormProps = {
  selectedDestination: string;
  onBookingComplete?: () => void;
};

const BookingForm: React.FC<BookingFormProps> = ({ 
  selectedDestination,
  onBookingComplete
}) => {
  const [, navigate] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const { user } = useAuth();
  const editId = new URLSearchParams(search).get("edit");
  const [isEditMode, setIsEditMode] = useState(!!editId);
  
  // If in edit mode, fetch the booking details
  const { data: booking, isLoading: isLoadingBooking } = useQuery<Booking>({
    queryKey: [`/api/bookings/${editId}`],
    enabled: !!editId,
  });

  // Form setup
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      destination: selectedDestination || "",
      departureDate: "",
      returnDate: "",
      travelClass: "economy",
      numberOfTravelers: 1,
    },
  });

  // Update form when selectedDestination changes
  useEffect(() => {
    if (selectedDestination && !isEditMode) {
      form.setValue("destination", selectedDestination);
    }
  }, [selectedDestination, form, isEditMode]);

  // Update form when editing an existing booking
  useEffect(() => {
    if (booking && isEditMode) {
      const departureDate = new Date(booking.departureDate)
        .toISOString()
        .split("T")[0];
      
      const returnDate = booking.returnDate
        ? new Date(booking.returnDate).toISOString().split("T")[0]
        : "";
      
      form.reset({
        destination: booking.destination,
        departureDate,
        returnDate,
        travelClass: booking.travelClass as "economy" | "luxury" | "vip",
        numberOfTravelers: booking.numberOfTravelers,
      });
    }
  }, [booking, form, isEditMode]);

  // Create or update booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      // Calculate price based on destination and class
      const basePrice = getDestinationBasePrice(data.destination);
      const classMultiplier = getClassPriceMultiplier(data.travelClass);
      const price = basePrice * classMultiplier * data.numberOfTravelers;
      
      const payload = {
        ...data,
        price,
        departureDate: new Date(data.departureDate).toISOString(),
        returnDate: data.returnDate ? new Date(data.returnDate).toISOString() : null,
        status: isEditMode ? booking?.status : "confirmed",
        // The server will get the userId from the session
      };
      
      if (isEditMode && editId) {
        await apiRequest("PATCH", `/api/bookings/${editId}`, payload);
      } else {
        await apiRequest("POST", "/api/bookings", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: `Booking ${isEditMode ? "updated" : "created"}`,
        description: `Your booking has been successfully ${isEditMode ? "updated" : "created"}.`,
      });
      
      if (onBookingComplete) {
        onBookingComplete();
      }
      
      if (isEditMode) {
        navigate("/");
      } else {
        form.reset();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} booking. Please try again.`,
        variant: "destructive",
      });
    },
  });

  // Helper functions for price calculation
  const getDestinationBasePrice = (destination: string): number => {
    const prices: Record<string, number> = {
      mercury: 200000,
      venus: 250000,
      earth: 100000,
      mars: 300000,
      saturn: 600000,
    };
    return prices[destination.toLowerCase()] || 200000;
  };

  const getClassPriceMultiplier = (travelClass: string): number => {
    const multipliers: Record<string, number> = {
      economy: 1,
      luxury: 1.5,
      vip: 2.5,
    };
    return multipliers[travelClass.toLowerCase()] || 1;
  };

  const onSubmit = (data: BookingFormData) => {
    bookingMutation.mutate(data);
  };

  const formatToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  if (isLoadingBooking && isEditMode) {
    return <div className="p-4 text-center">Loading booking details...</div>;
  }

  return (
    <div className="bg-black/50 rounded-xl p-6 border border-white/5 backdrop-blur-sm">
      <h2 className="text-xl font-['Orbitron'] font-bold mb-4 text-amber-400 flex items-center">
        <i className="ri-calendar-line mr-2"></i> {isEditMode ? "Edit Booking" : "Trip Details"}
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full bg-black border border-white/20 rounded-md p-2 text-slate-100 focus:border-amber-400 focus:ring focus:ring-amber-400/20 focus:outline-none"
                    disabled={isEditMode}
                  >
                    <option value="">Select a destination</option>
                    <option value="mercury">Mercury</option>
                    <option value="venus">Venus</option>
                    <option value="earth">Earth (Return)</option>
                    <option value="mars">Mars</option>
                    <option value="saturn">Saturn Rings Tour</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="departureDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departure Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    min={formatToday()}
                    className="w-full bg-black border border-white/20 rounded-md p-2 text-slate-100 focus:border-amber-400 focus:ring focus:ring-amber-400/20 focus:outline-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="returnDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Return Date (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    min={form.watch("departureDate") || formatToday()}
                    className="w-full bg-black border border-white/20 rounded-md p-2 text-slate-100 focus:border-amber-400 focus:ring focus:ring-amber-400/20 focus:outline-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="travelClass"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Travel Class</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 gap-3 mt-2"
                  >
                    <FormItem className="flex items-start space-x-3 p-3 rounded border border-white/10 hover:border-amber-400/50 cursor-pointer transition-colors">
                      <FormControl>
                        <RadioGroupItem value="economy" id="economy" />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel htmlFor="economy" className="font-medium">Economy Shuttle</FormLabel>
                        <p className="text-xs text-slate-300/50">Basic amenities, shared quarters</p>
                      </div>
                    </FormItem>
                    <FormItem className="flex items-start space-x-3 p-3 rounded border border-white/10 hover:border-amber-400/50 cursor-pointer transition-colors">
                      <FormControl>
                        <RadioGroupItem value="luxury" id="luxury" />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel htmlFor="luxury" className="font-medium">Luxury Cabin</FormLabel>
                        <p className="text-xs text-slate-300/50">Private suite, premium dining</p>
                      </div>
                    </FormItem>
                    <FormItem className="flex items-start space-x-3 p-3 rounded border border-white/10 hover:border-amber-400/50 cursor-pointer transition-colors">
                      <FormControl>
                        <RadioGroupItem value="vip" id="vip" />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel htmlFor="vip" className="font-medium">VIP Zero-Gravity</FormLabel>
                        <p className="text-xs text-slate-300/50">Exclusive access, personalized service</p>
                      </div>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="numberOfTravelers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Travelers</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    min={1}
                    max={10}
                    className="w-full bg-black border border-white/20 rounded-md p-2 text-slate-100 focus:border-amber-400 focus:ring focus:ring-amber-400/20 focus:outline-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-4">
            <Button
              type="submit"
              disabled={bookingMutation.isPending}
              className="w-full bg-amber-400 hover:bg-amber-400/80 text-black font-bold py-2 px-4 rounded transition-colors"
            >
              {bookingMutation.isPending ? (
                <span className="flex items-center">
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Processing...
                </span>
              ) : (
                isEditMode ? "Update Booking" : "Continue to Checkout"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BookingForm;
