"use client"

import { useState, useEffect } from "react"
import { SmileIcon as Tooth, Save, RotateCcw, Info, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { saveOdontogramAction, getOdontogramAction } from "@/app/actions/odontogram"
import { useToast } from "@/hooks/use-toast"

interface OdontogramProps {
  patientId: string
  initialData?: any
}

interface ToothData {
  id: number
  status: "healthy" | "cavity" | "filled" | "crown" | "missing" | "root_canal" | "implant"
  notes: string
}

export function Odontogram({ patientId, initialData }: OdontogramProps) {
  const { toast } = useToast()

  // Initialize teeth data (32 adult teeth)
  const [teethData, setTeethData] = useState<ToothData[]>(
    Array.from({ length: 32 }, (_, i) => ({
      id: i + 1,
      status: "healthy",
      notes: "",
    })),
  )

  const [selectedTooth, setSelectedTooth] = useState<ToothData | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing odontogram data on component mount
  useEffect(() => {
    if (initialData?.teeth_data && Array.isArray(initialData.teeth_data)) {
      setTeethData(initialData.teeth_data)
    } else {
      // Try to load from server if no initial data
      loadOdontogramData()
    }
  }, [patientId, initialData])

  const loadOdontogramData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getOdontogramAction(patientId)

      if (result.error) {
        if (result.error.includes('relation "public.odontogram" does not exist')) {
          setError("Odontogram feature is not yet set up. Please contact your administrator to enable this feature.")
        } else {
          setError(result.error)
        }
      } else if (result.data?.teeth_data && Array.isArray(result.data.teeth_data)) {
        setTeethData(result.data.teeth_data)
      }
    } catch (error) {
      console.error("Error loading odontogram:", error)
      setError("Failed to load odontogram data")
    } finally {
      setIsLoading(false)
    }
  }

  // Tooth numbering system (Universal/American system)
  const upperTeeth = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  const lowerTeeth = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17]

  const getToothColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "fill-white stroke-gray-300"
      case "cavity":
        return "fill-red-200 stroke-red-400"
      case "filled":
        return "fill-blue-200 stroke-blue-400"
      case "crown":
        return "fill-yellow-200 stroke-yellow-400"
      case "missing":
        return "fill-gray-200 stroke-gray-400 opacity-50"
      case "root_canal":
        return "fill-purple-200 stroke-purple-400"
      case "implant":
        return "fill-green-200 stroke-green-400"
      default:
        return "fill-white stroke-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800"
      case "cavity":
        return "bg-red-100 text-red-800"
      case "filled":
        return "bg-blue-100 text-blue-800"
      case "crown":
        return "bg-yellow-100 text-yellow-800"
      case "missing":
        return "bg-gray-100 text-gray-800"
      case "root_canal":
        return "bg-purple-100 text-purple-800"
      case "implant":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleToothClick = (toothId: number) => {
    const tooth = teethData.find((t) => t.id === toothId)
    if (tooth) {
      setSelectedTooth(tooth)
    }
  }

  const updateToothStatus = (status: string) => {
    if (selectedTooth) {
      setTeethData((prev) =>
        prev.map((tooth) => (tooth.id === selectedTooth.id ? { ...tooth, status: status as any } : tooth)),
      )
      setSelectedTooth((prev) => (prev ? { ...prev, status: status as any } : null))
      setHasChanges(true)
    }
  }

  const updateToothNotes = (notes: string) => {
    if (selectedTooth) {
      setTeethData((prev) => prev.map((tooth) => (tooth.id === selectedTooth.id ? { ...tooth, notes } : tooth)))
      setSelectedTooth((prev) => (prev ? { ...prev, notes } : null))
      setHasChanges(true)
    }
  }

  const saveChanges = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const result = await saveOdontogramAction(patientId, teethData)

      if (result.error) {
        setError(result.error)
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setHasChanges(false)
        toast({
          title: "Success",
          description: "Odontogram saved successfully",
        })
      }
    } catch (error) {
      console.error("Error saving odontogram:", error)
      setError("Failed to save odontogram")
      toast({
        title: "Error",
        description: "Failed to save odontogram",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const resetChanges = () => {
    setTeethData(
      Array.from({ length: 32 }, (_, i) => ({
        id: i + 1,
        status: "healthy",
        notes: "",
      })),
    )
    setSelectedTooth(null)
    setHasChanges(true) // Mark as changed so user can save the reset
  }

  const ToothSVG = ({ toothId, onClick }: { toothId: number; onClick: () => void }) => {
    const tooth = teethData.find((t) => t.id === toothId)
    const isSelected = selectedTooth?.id === toothId

    return (
      <div className="relative">
        <svg
          width="40"
          height="50"
          viewBox="0 0 40 50"
          className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}
          onClick={onClick}
        >
          <path
            d="M20 5 C25 5, 30 10, 30 20 C30 35, 25 45, 20 45 C15 45, 10 35, 10 20 C10 10, 15 5, 20 5 Z"
            className={getToothColor(tooth?.status || "healthy")}
            strokeWidth="2"
          />
        </svg>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-medium">{toothId}</div>
      </div>
    )
  }

  if (error && error.includes("not yet set up")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tooth className="h-5 w-5" />
            Odontogram
          </CardTitle>
          <CardDescription>Interactive dental chart for tooth condition tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tooth className="h-5 w-5" />
              Odontogram
            </CardTitle>
            <CardDescription>Interactive dental chart for tooth condition tracking</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetChanges} disabled={isLoading || isSaving}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button size="sm" onClick={saveChanges} disabled={!hasChanges || isLoading || isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading odontogram...</div>
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                <Badge className="bg-red-100 text-red-800">Cavity</Badge>
                <Badge className="bg-blue-100 text-blue-800">Filled</Badge>
                <Badge className="bg-yellow-100 text-yellow-800">Crown</Badge>
                <Badge className="bg-purple-100 text-purple-800">Root Canal</Badge>
                <Badge className="bg-green-100 text-green-800">Implant</Badge>
                <Badge className="bg-gray-100 text-gray-800">Missing</Badge>
              </div>

              {/* Odontogram */}
              <div className="space-y-8">
                {/* Upper Teeth */}
                <div>
                  <h3 className="text-sm font-medium mb-4">Upper Teeth</h3>
                  <div className="flex justify-center gap-1">
                    {upperTeeth.map((toothId) => (
                      <ToothSVG key={toothId} toothId={toothId} onClick={() => handleToothClick(toothId)} />
                    ))}
                  </div>
                </div>

                {/* Lower Teeth */}
                <div>
                  <h3 className="text-sm font-medium mb-4">Lower Teeth</h3>
                  <div className="flex justify-center gap-1">
                    {lowerTeeth.map((toothId) => (
                      <ToothSVG key={toothId} toothId={toothId} onClick={() => handleToothClick(toothId)} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Tooth Details */}
              {selectedTooth && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Tooth #{selectedTooth.id} Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={selectedTooth.status} onValueChange={updateToothStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="healthy">Healthy</SelectItem>
                          <SelectItem value="cavity">Cavity</SelectItem>
                          <SelectItem value="filled">Filled</SelectItem>
                          <SelectItem value="crown">Crown</SelectItem>
                          <SelectItem value="root_canal">Root Canal</SelectItem>
                          <SelectItem value="implant">Implant</SelectItem>
                          <SelectItem value="missing">Missing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add notes about this tooth..."
                        value={selectedTooth.notes}
                        onChange={(e) => updateToothNotes(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Current Status:</span>
                      <Badge className={getStatusColor(selectedTooth.status)}>
                        {selectedTooth.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
