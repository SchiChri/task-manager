import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TaskDetailComponent } from './task-detail/task-detail.component'
import { TaskListComponent } from './task-list/task-list.component'

const routes: Routes = [
  {
    path: 'tasks',
    children: [
      {
        path: '',
        component: TaskListComponent
      },
      {
        path: ':taskId',
        component: TaskDetailComponent
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskRoutingModule { }
