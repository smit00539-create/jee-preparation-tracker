
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseData = () => {
  const { user, isGuest, guestId } = useAuth();

  const saveDailyTask = async (date: string, subject: string, taskData: any) => {
    if (isGuest) {
      // Save to localStorage for guests
      const guestKey = `jee-prepometer-timetable-${guestId}`;
      const existingData = JSON.parse(localStorage.getItem(guestKey) || '{}');
      const dateKey = `${date}-${subject}`;
      existingData[dateKey] = taskData;
      localStorage.setItem(guestKey, JSON.stringify(existingData));
      return;
    }

    if (!user) return;

    const { error } = await supabase
      .from('daily_tasks')
      .upsert({
        user_id: user.id,
        study_date: date,
        subject: subject,
        lecture_text: taskData.lectures?.text || '',
        lecture_done: taskData.lectures?.completed,
        lecture_time: taskData.lectures?.timeSpent || 0,
        notes_text: taskData.notes?.text || '',
        notes_done: taskData.notes?.completed,
        notes_time: taskData.notes?.timeSpent || 0,
        homework_text: taskData.homework?.text || '',
        homework_done: taskData.homework?.completed,
        homework_time: taskData.homework?.timeSpent || 0,
        modules_text: taskData.modules?.text || '',
        modules_done: taskData.modules?.completed,
        modules_time: taskData.modules?.timeSpent || 0,
        pyqs_text: taskData.pyqs?.text || '',
        pyqs_done: taskData.pyqs?.completed,
        pyqs_time: taskData.pyqs?.timeSpent || 0,
        remark: taskData.remarks || ''
      }, {
        onConflict: 'user_id,study_date,subject'
      });

    if (error) {
      console.error('Error saving daily task:', error);
    }
  };

  const loadDailyTasks = async (date: string) => {
    if (isGuest) {
      const guestKey = `jee-prepometer-timetable-${guestId}`;
      const existingData = JSON.parse(localStorage.getItem(guestKey) || '{}');
      const tasksForDate: any = {};
      
      Object.keys(existingData).forEach(key => {
        if (key.startsWith(date)) {
          const subject = key.split('-').pop();
          if (subject) {
            tasksForDate[subject] = existingData[key];
          }
        }
      });
      
      return tasksForDate;
    }

    if (!user) return {};

    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('study_date', date);

    if (error) {
      console.error('Error loading daily tasks:', error);
      return {};
    }

    const tasksForDate: any = {};
    data.forEach(task => {
      tasksForDate[task.subject] = {
        lectures: { 
          text: task.lecture_text || '', 
          completed: task.lecture_done,
          timeSpent: task.lecture_time || 0
        },
        notes: { 
          text: task.notes_text || '', 
          completed: task.notes_done,
          timeSpent: task.notes_time || 0
        },
        homework: { 
          text: task.homework_text || '', 
          completed: task.homework_done,
          timeSpent: task.homework_time || 0
        },
        modules: { 
          text: task.modules_text || '', 
          completed: task.modules_done,
          timeSpent: task.modules_time || 0
        },
        pyqs: { 
          text: task.pyqs_text || '', 
          completed: task.pyqs_done,
          timeSpent: task.pyqs_time || 0
        },
        remarks: task.remark || ''
      };
    });

    return tasksForDate;
  };

  const savePortionProgress = async (subject: string, chapterId: number, progressData: any) => {
    if (isGuest) {
      const guestKey = `jee-prepometer-progress-${guestId}`;
      const existingData = JSON.parse(localStorage.getItem(guestKey) || '{}');
      if (!existingData[subject]) existingData[subject] = {};
      existingData[subject][chapterId] = progressData;
      localStorage.setItem(guestKey, JSON.stringify(existingData));
      return;
    }

    if (!user) return;

    const { error } = await supabase
      .from('portion_progress')
      .upsert({
        user_id: user.id,
        subject: subject,
        chapter_id: chapterId,
        lectures_watched: progressData.lecturesWatched,
        notes_completed: progressData.notesCompleted,
        basics_formulas: progressData.basicsFormulas,
        modules_dpps: progressData.modulesDpps,
        jee_mains: progressData.jeeMains,
        revision1: progressData.revision1,
        revision2: progressData.revision2,
        remarks: progressData.remarks || ''
      }, {
        onConflict: 'user_id,subject,chapter_id'
      });

    if (error) {
      console.error('Error saving portion progress:', error);
    }
  };

  const loadPortionProgress = async () => {
    if (isGuest) {
      const guestKey = `jee-prepometer-progress-${guestId}`;
      return JSON.parse(localStorage.getItem(guestKey) || '{}');
    }

    if (!user) return {};

    const { data, error } = await supabase
      .from('portion_progress')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading portion progress:', error);
      return {};
    }

    const progressData: any = {};
    data.forEach(progress => {
      if (!progressData[progress.subject]) progressData[progress.subject] = {};
      progressData[progress.subject][progress.chapter_id] = {
        lecturesWatched: progress.lectures_watched,
        notesCompleted: progress.notes_completed,
        basicsFormulas: progress.basics_formulas,
        modulesDpps: progress.modules_dpps,
        jeeMains: progress.jee_mains,
        revision1: progress.revision1,
        revision2: progress.revision2,
        remarks: progress.remarks || ''
      };
    });

    return progressData;
  };

  return {
    saveDailyTask,
    loadDailyTasks,
    savePortionProgress,
    loadPortionProgress
  };
};
