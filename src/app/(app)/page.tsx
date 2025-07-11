"use client";

import { useToast } from "@/hooks/use-toast";
import { Message } from "@/model/User";
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const page = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setIsLoading] = useState<boolean>(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);

  const { toast } = useToast();

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;

  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");
      setValue("acceptMessages", response.data.isAcceptingMessage ?? false);
    } catch (error) {
      const axiosError = error as AxiosError;
      toast({
        title: "Error ",
        description:
          (axiosError.response?.data as ApiResponse)?.message ||
          "Failed to fetch message settings",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);
  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponse>("/api/get-messages");
        setMessages(response?.data?.messages || []);
        if (refresh) {
          toast({
            title: "refreshed messages",
            description: "Showing latest messages",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        toast({
          title: "Error ",
          description:
            (axiosError.response?.data as ApiResponse)?.message ||
            "Failed to fetch message settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages]
  );

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessage();
  }, [session, setValue, fetchAcceptMessage, fetchMessages]);

  //handle switch change

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast({
        title: response.data.message,
        variant: "default",
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      toast({
        title: "Error ",
        description:
          (axiosError.response?.data as ApiResponse)?.message ||
          "Failed to update accept-messages",
        variant: "destructive",
      });
    }
  };

  const { username } = session?.user as User;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Url Copied",
      description: "Profile Url has been copied to Url",
    });
  };

  if (!session || !session.user) {
    return <>Please Login</>;
  }
  return <>Dashboard</>;
};

export default page;
