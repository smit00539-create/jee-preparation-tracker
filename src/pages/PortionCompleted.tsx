
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, GraduationCap, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SUBJECTS, SUBJECT_NAMES, SUBJECT_COLORS } from "@/data/subjects";
import ToggleButton from "@/components/ToggleButton";
import { useToast } from "@/hooks/use-toast";

interface ChapterProgress {
  lecturesWatched: boolean | null;
  notesCompleted: boolean | null;
  basicsFormulas: boolean | null;
  modulesDpps: boolean | null;
  jeeMains: boolean | null;
  revision1: boolean | null;
  revision2: boolean | null;
  remarks: string;
}

type ProgressData = {
  [subject: string]: {
    [chapterId: number]: ChapterProgress;
  };
};

const PortionCompleted = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("physics");
  const [progressData, setProgressData] = useState<ProgressData>({});

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("jee-prepometer-progress");
    if (savedData) {
      try {
        setProgressData(JSON.parse(savedData));
      } catch (error) {
        console.error("Error loading progress data:", error);
      }
    }
  }, []);

  // Save data to localStorage whenever progressData changes
  useEffect(() => {
    localStorage.setItem("jee-prepometer-progress", JSON.stringify(progressData));
  }, [progressData]);

  const updateProgress = (subject: string, chapterId: number, field: keyof ChapterProgress, value: any) => {
    setProgressData(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [chapterId]: {
          ...prev[subject]?.[chapterId],
          [field]: value
        }
      }
    }));
  };

  const getProgress = (subject: string, chapterId: number): ChapterProgress => {
    return progressData[subject]?.[chapterId] || {
      lecturesWatched: null,
      notesCompleted: null,
      basicsFormulas: null,
      modulesDpps: null,
      jeeMains: null,
      revision1: null,
      revision2: null,
      remarks: ""
    };
  };

  const calculateSubjectStats = (subject: string) => {
    const chapters = SUBJECTS[subject];
    let completed = 0;
    let total = chapters.length;

    chapters.forEach(chapter => {
      const progress = getProgress(subject, chapter.id);
      const fields = [
        progress.lecturesWatched,
        progress.notesCompleted,
        progress.basicsFormulas,
        progress.modulesDpps,
        progress.jeeMains,
        progress.revision1,
        progress.revision2
      ];
      const completedFields = fields.filter(field => field === true).length;
      if (completedFields === fields.length) {
        completed++;
      }
    });

    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const exportToCSV = (subject: string) => {
    const chapters = SUBJECTS[subject];
    const headers = [
      "Chapter Name",
      "Lectures Watched",
      "Notes Completed", 
      "Basics & Formulas",
      "Modules & DPPs",
      "JEE Mains PYQs",
      "Revision 1",
      "Revision 2",
      "Remarks"
    ];

    const csvContent = [
      headers.join(","),
      ...chapters.map(chapter => {
        const progress = getProgress(subject, chapter.id);
        return [
          `"${chapter.name}"`,
          progress.lecturesWatched === true ? "✓" : progress.lecturesWatched === false ? "✗" : "",
          progress.notesCompleted === true ? "✓" : progress.notesCompleted === false ? "✗" : "",
          progress.basicsFormulas === true ? "✓" : progress.basicsFormulas === false ? "✗" : "",
          progress.modulesDpps === true ? "✓" : progress.modulesDpps === false ? "✗" : "",
          progress.jeeMains === true ? "✓" : progress.jeeMains === false ? "✗" : "",
          progress.revision1 === true ? "✓" : progress.revision1 === false ? "✗" : "",
          progress.revision2 === true ? "✓" : progress.revision2 === false ? "✗" : "",
          `"${progress.remarks}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${SUBJECT_NAMES[subject]}_Progress.csv`;
    link.click();

    toast({
      title: "Export Successful",
      description: `${SUBJECT_NAMES[subject]} progress exported to CSV`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Portion Completed</h1>
          </div>
        </div>

        {/* Subject Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {Object.keys(SUBJECTS).map(subject => {
            const stats = calculateSubjectStats(subject);
            return (
              <Card key={subject} className={`p-4 ${SUBJECT_COLORS[subject]} border-2`}>
                <h3 className="font-semibold text-lg mb-2">{SUBJECT_NAMES[subject]}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    {stats.completed}/{stats.total} chapters complete
                  </span>
                  <span className="font-bold text-lg">{stats.percentage}%</span>
                </div>
                <div className="w-full bg-white/50 rounded-full h-2 mt-2">
                  <div 
                    className="h-2 rounded-full bg-current transition-all duration-300"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Subject Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {Object.keys(SUBJECTS).map(subject => (
              <TabsTrigger key={subject} value={subject} className="text-sm">
                {SUBJECT_NAMES[subject]}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(SUBJECTS).map(subject => (
            <TabsContent key={subject} value={subject}>
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {SUBJECT_NAMES[subject]} Progress
                  </h2>
                  <Button 
                    onClick={() => exportToCSV(subject)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>

                {/* Progress Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 sticky top-0 z-10">
                        <th className="border border-gray-300 p-3 text-left min-w-[200px]">
                          Chapter Name
                        </th>
                        <th className="border border-gray-300 p-3 text-center min-w-[120px]">
                          Lectures Watched
                        </th>
                        <th className="border border-gray-300 p-3 text-center min-w-[120px]">
                          Notes Completed
                        </th>
                        <th className="border border-gray-300 p-3 text-center min-w-[120px]">
                          Basics & Formulas
                        </th>
                        <th className="border border-gray-300 p-3 text-center min-w-[120px]">
                          Modules & DPPs
                        </th>
                        <th className="border border-gray-300 p-3 text-center min-w-[120px]">
                          JEE Mains PYQs
                        </th>
                        <th className="border border-gray-300 p-3 text-center min-w-[100px]">
                          Revision 1
                        </th>
                        <th className="border border-gray-300 p-3 text-center min-w-[100px]">
                          Revision 2
                        </th>
                        <th className="border border-gray-300 p-3 text-center min-w-[200px]">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {SUBJECTS[subject].map(chapter => {
                        const progress = getProgress(subject, chapter.id);
                        return (
                          <tr key={chapter.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-3 font-medium">
                              {chapter.name}
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <ToggleButton
                                value={progress.lecturesWatched}
                                onChange={(value) => updateProgress(subject, chapter.id, "lecturesWatched", value)}
                              />
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <ToggleButton
                                value={progress.notesCompleted}
                                onChange={(value) => updateProgress(subject, chapter.id, "notesCompleted", value)}
                              />
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <ToggleButton
                                value={progress.basicsFormulas}
                                onChange={(value) => updateProgress(subject, chapter.id, "basicsFormulas", value)}
                              />
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <ToggleButton
                                value={progress.modulesDpps}
                                onChange={(value) => updateProgress(subject, chapter.id, "modulesDpps", value)}
                              />
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <ToggleButton
                                value={progress.jeeMains}
                                onChange={(value) => updateProgress(subject, chapter.id, "jeeMains", value)}
                              />
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <ToggleButton
                                value={progress.revision1}
                                onChange={(value) => updateProgress(subject, chapter.id, "revision1", value)}
                                size="sm"
                              />
                            </td>
                            <td className="border border-gray-300 p-3 text-center">
                              <ToggleButton
                                value={progress.revision2}
                                onChange={(value) => updateProgress(subject, chapter.id, "revision2", value)}
                                size="sm"
                              />
                            </td>
                            <td className="border border-gray-300 p-3">
                              <Input
                                value={progress.remarks}
                                onChange={(e) => updateProgress(subject, chapter.id, "remarks", e.target.value)}
                                placeholder="Add remarks..."
                                className="w-full border-0 focus-visible:ring-0"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default PortionCompleted;
