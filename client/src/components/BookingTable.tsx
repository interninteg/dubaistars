import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Booking } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type BookingTableProps = {
  className?: string;
};

const BookingTable: React.FC<BookingTableProps> = ({ className }) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);
  
  const { data: bookings = [], isLoading, isError } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/bookings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Booking deleted",
        description: "Your booking has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleEdit = (id: number) => {
    navigate(`/book?edit=${id}`);
  };

  const handleDelete = () => {
    if (bookingToDelete) {
      deleteBookingMutation.mutate(bookingToDelete);
      setBookingToDelete(null);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading bookings...</div>;
  }

  if (isError) {
    return <div className="p-4 text-center text-red-500">Error loading bookings</div>;
  }

  const getDestinationInitial = (destination: string) => {
    return destination.charAt(0).toUpperCase();
  };

  const getDestinationColor = (destination: string) => {
    const colors: Record<string, string> = {
      mercury: "bg-gray-500/30 text-gray-300",
      venus: "bg-yellow-500/30 text-yellow-300",
      earth: "bg-blue-500/30 text-blue-300",
      mars: "bg-red-500/30 text-red-300",
      saturn: "bg-yellow-500/30 text-yellow-300",
    };
    return colors[destination.toLowerCase()] || "bg-purple-500/30 text-purple-300";
  };

  const getTravelClassStyle = (travelClass: string) => {
    const styles: Record<string, string> = {
      economy: "bg-slate-300/20 text-slate-300",
      luxury: "bg-purple-700/20 text-purple-300",
      vip: "bg-amber-400/20 text-amber-400",
    };
    return styles[travelClass.toLowerCase()] || styles.economy;
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: "bg-green-500/20 text-green-500",
      pending: "bg-yellow-500/20 text-yellow-500",
      cancelled: "bg-red-500/20 text-red-500",
    };
    return styles[status.toLowerCase()] || styles.pending;
  };

  return (
    <div className={`bg-black/50 rounded-xl p-6 border border-white/5 backdrop-blur-sm ${className}`}>
      <h2 className="text-xl font-['Orbitron'] font-bold mb-4 text-amber-400 flex items-center">
        <i className="ri-calendar-check-line mr-2"></i> Your Bookings
      </h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left text-xs font-medium text-slate-300/70 uppercase tracking-wider">Destination</TableHead>
              <TableHead className="text-left text-xs font-medium text-slate-300/70 uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-left text-xs font-medium text-slate-300/70 uppercase tracking-wider">Class</TableHead>
              <TableHead className="text-left text-xs font-medium text-slate-300/70 uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-right text-xs font-medium text-slate-300/70 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/5">
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-slate-300/70">
                  No bookings found. <Link href="/book" className="text-amber-400 hover:underline">Book a trip now!</Link>
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full ${getDestinationColor(booking.destination)} flex items-center justify-center`}>
                        {getDestinationInitial(booking.destination)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium capitalize">{booking.destination}</div>
                        <div className="text-xs text-slate-300/50">
                          {booking.returnDate ? "Round Trip" : "One Way"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 whitespace-nowrap">
                    <div className="text-sm">{formatDate(booking.departureDate.toString())}</div>
                    <div className="text-xs text-slate-300/50">{formatTime(booking.departureDate.toString())} UAE Time</div>
                  </TableCell>
                  <TableCell className="py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTravelClassStyle(booking.travelClass)}`}>
                      {booking.travelClass === "vip" ? "VIP Zero-Gravity" : booking.travelClass === "luxury" ? "Luxury Cabin" : "Economy Shuttle"}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 whitespace-nowrap text-right text-sm">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(booking.id)}
                      className="text-slate-300/70 hover:text-amber-400 px-2"
                    >
                      <i className="ri-edit-line"></i>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBookingToDelete(booking.id)}
                          className="text-slate-300/70 hover:text-red-500 px-2"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete your booking for {booking.destination}. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-6">
        <Link href="/book">
          <Button className="bg-purple-700 hover:bg-purple-700/80 text-white">
            <i className="ri-add-line mr-1"></i> New Booking
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BookingTable;
