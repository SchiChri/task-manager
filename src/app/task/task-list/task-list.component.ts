import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { TaskService } from './../shared/task.service';
import { Task, Priority, Status } from './../shared/task';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnDestroy {
  // Make priority and status enums available in the template
  Priority = Priority;
  Status = Status;

  // all currently known tasks
  public tasks: Task[];

  // subscription for tasks
  private taskSubscription: Subscription;

  constructor(
    private taskService: TaskService,
    private router: Router
  ) { }

  ngOnInit() {
    this.taskSubscription = this.taskService.getOrderedTasks()
    .subscribe( tasks => {
      this.tasks = tasks;
    }, error => {
      console.log( 'error', error );
    } );
  }

  ngOnDestroy() {
    this.taskSubscription.unsubscribe();
  }

  private itemClicked( event: any, task: Task ) {
    this.router.navigate( [ '/tasks', task.id ] );
  }

  private taskCheckboxClicked( event: any, task: Task ) {
    event.stopPropagation();

    // update the status in the next digest circle
    // (interferes with cb event otherwhise => cb state wrong)
    setTimeout( () => {
      this.taskService.setTaskStatus(
        task,
        task.isFinished() ? Status.NEW : Status.FINISHED
      )
      .subscribe( updatedTask => {}, error => {
        console.error( 'Error: ', error );
      } );
    } );

  }
}
