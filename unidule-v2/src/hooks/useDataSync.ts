import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import type { Subject, Task, Career, Seminar, Elective } from '../types';

export function useDataSync() {
  const session = useStore(state => state.session);
  const setCareer = useStore(state => state.setCareer);
  const setTasks = useStore(state => state.setTasks);
  const profile = useStore(state => state.profile);

  useEffect(() => {
    if (!session || !profile) return;

    async function loadData() {
      const uid = session!.user.id;
      const planId = profile?.plan_id || '2016';

      const [
        { data: activeSubsData },
        { data: tasksData },
        { data: globalSubsData },
        { data: progressData },
        { data: seminarsData },
        { data: electivesData }
      ] = await Promise.all([
        supabase.from('user_active_subjects').select('*').eq('user_id', uid),
        supabase.from('user_tasks').select('*').eq('user_id', uid),
        supabase.from('global_subjects').select('*').eq('plan_id', planId).order('year').order('semester'),
        supabase.from('user_progress').select('*').eq('user_id', uid),
        supabase.from('user_seminars').select('*').eq('user_id', uid),
        supabase.from('global_electives').select('*').eq('plan_id', planId)
      ]);

      // Map Tasks
      if (tasksData) {
        const mappedTasks: Task[] = tasksData.map((t: any) => ({
          id: t.id,
          subjectId: t.subject_id,
          title: t.title,
          type: t.type,
          dueDate: t.due_date,
          done: t.done
        }));
        setTasks(mappedTasks);
      }

      // Map Career and Subjects
      if (globalSubsData) {
        const subjects: Subject[] = globalSubsData.map((g: any) => {
          const prog = (progressData || []).find((p: any) => p.global_id === g.code);
          const active = (activeSubsData || []).find((a: any) => a.code === g.code || a.id === g.code);
          
          return {
            id: g.code,
            name: g.name,
            year: parseInt(g.year, 10) || 1,
            period: parseInt(g.semester, 10) || 1,
            correlatives: g.correlatives?.toCurse || [],
            status: prog?.status || (active ? 'cursando' : 'pendiente'),
            grade: prog ? parseFloat(prog.grade) : null,
            regDate: prog?.reg_date || null,
            expDate: prog?.exp_date || null,
            layout_row: g.layout_row || 0,
            
            // Active subject metadata if cursando
            color: active?.color || '#D8D2BE',
            room: active?.room || '',
            schedules: active?.schedule || []
          };
        });

        const seminars: Seminar[] = (seminarsData || []).map((s: any) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          category: s.category,
          hours: s.hours,
          status: s.status,
          date: s.date,
          notes: s.notes
        }));

        const electives: Elective[] = (electivesData || []).map((e: any) => {
          const prog = (progressData || []).find((p: any) => p.global_id === e.code && p.type === 'elective');
          return {
            id: e.code,
            code: e.code,
            name: e.name,
            category: e.category,
            credits: e.credits,
            status: prog?.status || 'pendiente',
            grade: prog ? parseFloat(prog.grade) : null,
            regDate: prog?.reg_date || null,
            expDate: prog?.exp_date || null,
          };
        });

        const career: Career = {
          id: planId,
          name: profile?.career || 'Ingeniería',
          subjects,
          seminars,
          electives
        };

        setCareer(career);
      }
    }

    loadData();
  }, [session, profile, setCareer, setTasks]);
}
