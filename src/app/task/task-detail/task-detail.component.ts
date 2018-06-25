import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { FormBuilder, FormGroup, Validators, FormsModule, NgForm } from '@angular/forms';

import { TaskService } from './../shared/task.service';
import { Task, Priority, Status } from './../shared/task';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {
  // Make priority and status enums available in the template
  Priority = Priority;
  Status = Status;

  private taskForm: FormGroup;

  // holds the invalid id if the url parameter is not a number
  private invalidTaskId: string;
  // local copy of the displayed task
  private task: Task;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.taskForm = formBuilder.group( {
      title: [ '', Validators.required ],
      description: '',
      dueDate: [ new Date(), Validators.required ],
      priority: Priority.LOW,
      status: Status.NEW
    } );
  }

  ngOnInit() {
    this.route.params.subscribe( params => {
      if( params.taskId ) {
        let taskId = parseInt( params.taskId );

        if( taskId ) {
          this.taskService.getTask( taskId )
          .subscribe( task => {
            this.task = task;
            if( task ) {
              this.updateFormWithValue( task );
            }
          }, error => {
            console.log("error", error);
            this.task = null;
          } );
        } else {
          this.invalidTaskId = params.taskId;
        }
      }
    } );
  }

  private updateFormWithValue( task: Task ) {
    this.taskForm.get( 'dueDate' ).setValue( task.dueDate );
    this.taskForm.get( 'title' ).setValue( task.title );
    this.taskForm.get( 'description' ).setValue( task.description );
    this.taskForm.get( 'priority' ).setValue( task.priority );
    this.taskForm.get( 'status' ).setValue( task.status );
  }

  private updateTask( taskData: any ) {
    this.taskService.updateTask(
      new Task( {
        id: this.task.id,
        resolvedAt: this.task.resolvedAt,
        title: this.taskForm.value.title,
        description: this.taskForm.value.description,
        dueDate: this.taskForm.value.dueDate,
        priority: Priority[ this.taskForm.value.priority ],
        status: Status[ this.taskForm.value.status ]
      } )
    )
    .subscribe( updatedTask => {
      this.router.navigate( [ '/tasks' ] );
    }, error => {
      console.error( 'Error: ', error );
    } );
  }
}
