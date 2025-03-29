import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { UseFormReturn } from "react-hook-form";
import { Location } from "../api";
import {
	Search,
	X,
	Building2,
	Check,
	PlusCircle,
	AlertCircle,
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "./ui/alert";
