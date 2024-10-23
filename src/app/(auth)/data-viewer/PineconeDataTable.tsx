'use client'

import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search, Trash2 } from 'lucide-react'

interface FileData {
  name: string
  updated_on: string
  [key: string]: any
}

interface PineconeDataTableProps {
  initialData: { files: FileData[] }
}

export default function PineconeDataTable({ initialData }: PineconeDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const filesPerPage = 10
  const files = initialData.files

  if (!files || files.length === 0) {
    return <div className="text-center text-gray-500 mt-8">No files available</div>
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const indexOfLastFile = currentPage * filesPerPage
  const indexOfFirstFile = indexOfLastFile - filesPerPage
  const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile)

  const totalPages = Math.ceil(filteredFiles.length / filesPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <Card className="w-full max-w-[1200px] mx-auto h-[calc(100vh-100px)] flex flex-col">
      <CardHeader className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto px-4 py-2">
        <Table className="w-full">
          <TableHeader className="bg-muted sticky top-0">
            <TableRow>
              <TableHead className="w-[60%] py-2 text-left text-sm font-semibold text-muted-foreground">File Name</TableHead>
              <TableHead className="w-[30%] py-2 text-right text-sm font-semibold text-muted-foreground">Last Updated</TableHead>
              <TableHead className="w-[10%] py-2 text-right text-sm font-semibold text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentFiles.map((file, index) => (
              <TableRow key={index} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                <TableCell className="py-2 font-medium">{file.name}</TableCell>
                <TableCell className="py-2 text-right">{formatDate(file.updated_on)}</TableCell>
                <TableCell className="py-2 text-right">
                  <Button variant="ghost" size="sm" className="hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex items-center justify-between px-4 py-2 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {indexOfFirstFile + 1} to {Math.min(indexOfLastFile, filteredFiles.length)} of {filteredFiles.length} files
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}